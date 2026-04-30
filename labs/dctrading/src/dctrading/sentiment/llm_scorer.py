"""LLM-based sentiment scorer.

Supports two backends:
  - API: Any OpenAI-compatible endpoint (Gemini, OpenAI, OpenRouter, local vLLM)
  - Local MLX: Runs Qwen3.5-9B-4bit directly on Apple Silicon via mlx-lm

Design choices (from research):
  - Classification over probability (LLMs are good at this, bad at calibrated probs)
  - Structured JSON output with confidence + materiality filter
  - Headlines + summaries (best signal-to-cost ratio)
  - Batch scoring (all headlines in one call → cheaper + better context)
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass

from dctrading.sentiment.news_client import NewsItem

__all__ = ["LLMScorer", "MLXLocalScorer", "SentimentResult"]

SYSTEM_PROMPT = """\
You are a crypto market analyst AI. You receive a batch of recent Bitcoin news \
headlines and summaries. Your job is to assess the overall market sentiment and \
how material these news items are for BTC price action.

Rules:
- Focus on NEWS THAT MOVES PRICE, not noise. Regulatory actions, ETF flows, \
exchange hacks, macro policy (Fed, CPI) are high materiality. Opinion pieces, \
minor altcoin news, recycled narratives are low materiality.
- "bullish" = likely upward pressure on BTC price in next 1-24h
- "bearish" = likely downward pressure on BTC price in next 1-24h
- "neutral" = no clear directional signal or mixed signals cancel out
- confidence = how sure you are about the sentiment direction (0.0-1.0)
- materiality = how much these news items should actually affect trading decisions (0.0-1.0). \
Low materiality means "this is noise, don't change your trade plan."

Respond with ONLY valid JSON, no markdown fences, no explanation."""

USER_PROMPT_TEMPLATE = """\
Here are {count} recent Bitcoin news items (newest first):

{news_block}

Analyze the overall sentiment and return JSON:
{{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": 0.0-1.0,
  "materiality": 0.0-1.0,
  "key_factors": ["factor1", "factor2", "factor3"],
  "reasoning": "One sentence summary of why"
}}"""


@dataclass(frozen=True, slots=True)
class SentimentResult:
    """Structured output from LLM sentiment scoring."""

    sentiment: str  # "bullish", "bearish", "neutral"
    confidence: float  # 0.0 - 1.0
    materiality: float  # 0.0 - 1.0
    key_factors: list[str]
    reasoning: str
    model: str = ""
    prompt_tokens: int = 0
    completion_tokens: int = 0

    @property
    def directional_score(self) -> float:
        """Signed confidence: positive=bullish, negative=bearish, near-zero=neutral.

        Range: -1.0 to 1.0. Incorporates materiality as a weight.
        """
        direction = {"bullish": 1.0, "bearish": -1.0, "neutral": 0.0}.get(
            self.sentiment, 0.0
        )
        return direction * self.confidence * self.materiality


class LLMScorer:
    """Score news sentiment using OpenAI-compatible LLM API.

    Default: Gemini 2.5 Flash (free tier: 1500 req/day, 15 RPM).
    Supports any OpenAI-compatible endpoint (OpenAI, OpenRouter, local vLLM, etc).
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gemini-2.5-flash",
        base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/",
        temperature: float = 0.1,
        max_tokens: int = 1024,
    ) -> None:
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._max_retries = 3
        self.client = OpenAI(
            api_key=api_key or os.environ.get("GEMINI_API_KEY", ""),
            base_url=base_url,
        )

    def _format_news_block(self, items: list[NewsItem]) -> str:
        """Format news items into a readable block for the prompt."""
        lines: list[str] = []
        for i, item in enumerate(items, 1):
            age = ""
            if item.published_at:
                from datetime import datetime, timezone

                delta = datetime.now(timezone.utc) - item.published_at
                hours = delta.total_seconds() / 3600
                if hours < 1:
                    age = f" ({int(delta.total_seconds() / 60)}m ago)"
                elif hours < 24:
                    age = f" ({hours:.0f}h ago)"
                else:
                    age = f" ({hours / 24:.0f}d ago)"

            summary_part = f"\n   Summary: {item.summary}" if item.summary else ""
            lines.append(f"{i}. [{item.source}]{age} {item.title}{summary_part}")

        return "\n\n".join(lines)

    def score(self, items: list[NewsItem]) -> SentimentResult:
        """Score a batch of news items for BTC sentiment.

        Args:
            items: List of NewsItem to analyze (send newest first).

        Returns:
            SentimentResult with classification, confidence, materiality.

        Raises:
            RuntimeError: If LLM response cannot be parsed.
        """
        if not items:
            return SentimentResult(
                sentiment="neutral",
                confidence=0.0,
                materiality=0.0,
                key_factors=[],
                reasoning="No news items to analyze.",
                model=self.model,
            )

        news_block = self._format_news_block(items)
        user_prompt = USER_PROMPT_TEMPLATE.format(
            count=len(items), news_block=news_block
        )

        import time as _time

        last_err = None
        for attempt in range(self._max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                )
                break
            except Exception as e:
                last_err = e
                wait = 2 ** attempt * 15  # 15s, 30s, 60s
                print(f"[sentiment] LLM call failed (attempt {attempt + 1}/{self._max_retries}): {e}")
                if attempt < self._max_retries - 1:
                    print(f"[sentiment] Retrying in {wait}s...")
                    _time.sleep(wait)
        else:
            raise RuntimeError(f"LLM scoring failed after {self._max_retries} attempts: {last_err}") from last_err

        content = response.choices[0].message.content or ""
        usage = response.usage

        # Parse JSON response
        try:
            # Strip markdown fences if model adds them despite instructions
            clean = content.strip()
            if clean.startswith("```"):
                # Remove opening fence (```json or ```)
                clean = clean.split("\n", 1)[-1]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            data = json.loads(clean)
        except json.JSONDecodeError as e:
            # Try to salvage truncated JSON by closing braces
            try:
                patched = clean.rstrip() + '"}'
                data = json.loads(patched)
            except json.JSONDecodeError:
                raise RuntimeError(
                    f"Failed to parse LLM response as JSON: {e}\nRaw: {content}"
                ) from e

        return SentimentResult(
            sentiment=data.get("sentiment", "neutral"),
            confidence=max(0.0, min(1.0, float(data.get("confidence", 0.5)))),
            materiality=max(0.0, min(1.0, float(data.get("materiality", 0.5)))),
            key_factors=data.get("key_factors", []),
            reasoning=data.get("reasoning", ""),
            model=self.model,
            prompt_tokens=usage.prompt_tokens if usage else 0,
            completion_tokens=usage.completion_tokens if usage else 0,
        )


class MLXLocalScorer:
    """Score news sentiment using local MLX model on Apple Silicon.

    Default: Qwen3.5-9B-4bit. Runs entirely on-device, zero API cost.
    Requires: pip install mlx-lm
    """

    def __init__(
        self,
        model_id: str = "mlx-community/Qwen3.5-9B-4bit",
        max_tokens: int = 512,
        temperature: float = 0.1,
    ) -> None:
        from mlx_lm import load

        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self._model, self._tokenizer = load(model_id)

    def _format_news_block(self, items: list[NewsItem]) -> str:
        """Format news items into a readable block for the prompt."""
        lines: list[str] = []
        for i, item in enumerate(items, 1):
            age = ""
            if item.published_at:
                from datetime import datetime, timezone
                now = datetime.now(timezone.utc)
                pub = item.published_at if item.published_at.tzinfo else item.published_at.replace(tzinfo=timezone.utc)
                delta = now - pub
                hours = delta.total_seconds() / 3600
                if hours < 1:
                    age = f" ({int(delta.total_seconds() / 60)}m ago)"
                elif hours < 24:
                    age = f" ({hours:.0f}h ago)"
                else:
                    age = f" ({hours / 24:.0f}d ago)"

            summary_part = f"\n   Summary: {item.summary}" if item.summary else ""
            lines.append(f"{i}. [{item.source}]{age} {item.title}{summary_part}")

        return "\n\n".join(lines)

    def score(self, items: list[NewsItem]) -> SentimentResult:
        """Score a batch of news items for BTC sentiment using local MLX model."""
        from mlx_lm import generate

        if not items:
            return SentimentResult(
                sentiment="neutral",
                confidence=0.0,
                materiality=0.0,
                key_factors=[],
                reasoning="No news items to analyze.",
                model=self.model_id,
            )

        news_block = self._format_news_block(items)
        user_prompt = USER_PROMPT_TEMPLATE.format(
            count=len(items), news_block=news_block
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        prompt = self._tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=False,
            enable_thinking=False,
        )

        content = generate(
            self._model,
            self._tokenizer,
            prompt=prompt,
            max_tokens=self.max_tokens,
            verbose=False,
        )

        # Parse JSON response
        try:
            clean = content.strip()
            if clean.startswith("```"):
                clean = clean.split("\n", 1)[-1]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            data = json.loads(clean)
        except json.JSONDecodeError as e:
            try:
                patched = clean.rstrip() + '"}'
                data = json.loads(patched)
            except json.JSONDecodeError:
                raise RuntimeError(
                    f"Failed to parse MLX response as JSON: {e}\nRaw: {content}"
                ) from e

        return SentimentResult(
            sentiment=data.get("sentiment", "neutral"),
            confidence=max(0.0, min(1.0, float(data.get("confidence", 0.5)))),
            materiality=max(0.0, min(1.0, float(data.get("materiality", 0.5)))),
            key_factors=data.get("key_factors", []),
            reasoning=data.get("reasoning", ""),
            model=self.model_id,
        )
