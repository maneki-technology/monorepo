"""Combined confidence scorer: news fetch → LLM score → trade confidence.

This is the main entry point for the sentiment module. It orchestrates:
  1. Fetch recent BTC news from available APIs
  2. Score headlines + summaries via LLM
  3. Optionally blend with Alpha Vantage's pre-computed sentiment
  4. Return a final confidence score (0.0-1.0) for trade gating/sizing

Usage:
    scorer = SentimentConfidence(av_key="...", openai_key="...")
    result = scorer.evaluate()
    if result.trade_confidence > 0.7:
        # full position
    elif result.trade_confidence > 0.4:
        # half position
    else:
        # skip trade
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone

from dctrading.sentiment.llm_scorer import LLMScorer, SentimentResult
from dctrading.sentiment.news_client import AlphaVantageNews, NewsAPIClient, NewsItem

__all__ = ["SentimentConfidence", "ConfidenceResult"]


@dataclass(frozen=True, slots=True)
class ConfidenceResult:
    """Final confidence assessment for a trade decision."""

    trade_confidence: float  # 0.0-1.0, the number that matters
    direction: str  # "bullish", "bearish", "neutral"
    llm_result: SentimentResult
    av_sentiment_avg: float | None  # Alpha Vantage average score (-1 to 1)
    news_count: int
    freshest_news_age_hours: float
    sources_used: list[str]

    @property
    def should_trade(self) -> bool:
        """Whether confidence is high enough to take any position."""
        return self.trade_confidence >= 0.4

    @property
    def full_position(self) -> bool:
        """Whether confidence warrants full position size."""
        return self.trade_confidence >= 0.7

    @property
    def position_scale(self) -> float:
        """Position size multiplier: 0.0, 0.5, or 1.0."""
        if self.trade_confidence >= 0.7:
            return 1.0
        if self.trade_confidence >= 0.4:
            return 0.5
        return 0.0


class SentimentConfidence:
    """Orchestrates news fetching + LLM scoring into trade confidence.

    Combines multiple signals:
      - LLM classification (sentiment + confidence + materiality)
      - Alpha Vantage pre-computed sentiment (if available)
      - News freshness penalty (stale news = lower confidence)
    """

    def __init__(
        self,
        av_key: str | None = None,
        newsapi_key: str | None = None,
        openai_key: str | None = None,
        llm_model: str = "gemini-2.5-flash",
        llm_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/",
        max_articles: int = 20,
        av_weight: float = 0.3,
        llm_weight: float = 0.7,
    ) -> None:
        """Initialize the confidence scorer.

        Args:
            av_key: Alpha Vantage API key (or ALPHA_VANTAGE_API_KEY env var).
            newsapi_key: NewsAPI key (or NEWSAPI_KEY env var). Optional fallback.
            openai_key: OpenAI API key (or OPENAI_API_KEY env var).
            llm_model: Model to use for scoring.
            llm_base_url: Custom base URL for OpenAI-compatible API.
            max_articles: Max articles to fetch and score.
            av_weight: Weight for Alpha Vantage sentiment in final blend.
            llm_weight: Weight for LLM sentiment in final blend.
        """
        self.max_articles = max_articles
        self.av_weight = av_weight
        self.llm_weight = llm_weight

        # Initialize available clients
        self._av: AlphaVantageNews | None = None
        self._newsapi: NewsAPIClient | None = None

        av_key = av_key or os.environ.get("ALPHA_VANTAGE_API_KEY")
        if av_key:
            self._av = AlphaVantageNews(api_key=av_key)

        newsapi_key = newsapi_key or os.environ.get("NEWSAPI_KEY")
        if newsapi_key:
            self._newsapi = NewsAPIClient(api_key=newsapi_key)

        if not self._av and not self._newsapi:
            raise ValueError(
                "At least one news source required. "
                "Set ALPHA_VANTAGE_API_KEY or NEWSAPI_KEY."
            )

        self._llm = LLMScorer(
            api_key=openai_key,
            model=llm_model,
            base_url=llm_base_url,
        )

    def _fetch_news(self) -> tuple[list[NewsItem], list[str]]:
        """Fetch news from all available sources, deduplicate, sort by recency."""
        all_items: list[NewsItem] = []
        sources: list[str] = []

        if self._av:
            try:
                av_items = self._av.fetch(
                    tickers="CRYPTO:BTC", limit=self.max_articles
                )
                all_items.extend(av_items)
                sources.append("alpha_vantage")
            except Exception as e:
                print(f"[sentiment] Alpha Vantage fetch failed: {e}")

        if self._newsapi:
            try:
                na_items = self._newsapi.fetch(
                    query="bitcoin OR BTC", page_size=self.max_articles
                )
                all_items.extend(na_items)
                sources.append("newsapi")
            except Exception as e:
                print(f"[sentiment] NewsAPI fetch failed: {e}")

        if not all_items:
            return [], sources

        # Deduplicate by title similarity (exact match for now)
        seen_titles: set[str] = set()
        unique: list[NewsItem] = []
        for item in all_items:
            title_key = item.title.lower().strip()
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique.append(item)

        # Sort newest first, take top N
        unique.sort(key=lambda x: x.published_at, reverse=True)
        return unique[: self.max_articles], sources

    def _compute_av_average(self, items: list[NewsItem]) -> float | None:
        """Compute average Alpha Vantage sentiment from items that have it."""
        scored = [
            i.av_sentiment_score
            for i in items
            if i.av_sentiment_score is not None
        ]
        if not scored:
            return None
        return sum(scored) / len(scored)

    def _freshness_penalty(self, items: list[NewsItem]) -> float:
        """Penalize confidence if news is stale. Returns 0.0-1.0 multiplier."""
        if not items:
            return 0.0

        now = datetime.now(timezone.utc)
        newest = max(i.published_at for i in items)
        age_hours = (now - newest).total_seconds() / 3600

        if age_hours < 2:
            return 1.0  # Fresh news, no penalty
        if age_hours < 6:
            return 0.9
        if age_hours < 12:
            return 0.7
        if age_hours < 24:
            return 0.5
        return 0.3  # Very stale, heavy penalty

    def evaluate(self) -> ConfidenceResult:
        """Run the full confidence evaluation pipeline.

        Returns:
            ConfidenceResult with trade_confidence (0.0-1.0) and supporting data.
        """
        items, sources = self._fetch_news()

        if not items:
            return ConfidenceResult(
                trade_confidence=0.0,
                direction="neutral",
                llm_result=SentimentResult(
                    sentiment="neutral",
                    confidence=0.0,
                    materiality=0.0,
                    key_factors=[],
                    reasoning="No news available.",
                ),
                av_sentiment_avg=None,
                news_count=0,
                freshest_news_age_hours=float("inf"),
                sources_used=sources,
            )

        # Score via LLM
        llm_result = self._llm.score(items)

        # Get AV average if available
        av_avg = self._compute_av_average(items)

        # Blend scores
        # LLM directional_score is in [-1, 1], we want confidence in [0, 1]
        llm_confidence = abs(llm_result.directional_score)

        if av_avg is not None:
            # AV score is [-1, 1], convert to [0, 1] confidence
            av_confidence = abs(av_avg)
            blended = (
                self.llm_weight * llm_confidence + self.av_weight * av_confidence
            )
        else:
            # LLM only
            blended = llm_confidence

        # Apply freshness penalty
        freshness = self._freshness_penalty(items)
        final_confidence = blended * freshness

        # Clamp
        final_confidence = max(0.0, min(1.0, final_confidence))

        # Compute freshest news age
        now = datetime.now(timezone.utc)
        newest = max(i.published_at for i in items)
        age_hours = (now - newest).total_seconds() / 3600

        return ConfidenceResult(
            trade_confidence=final_confidence,
            direction=llm_result.sentiment,
            llm_result=llm_result,
            av_sentiment_avg=av_avg,
            news_count=len(items),
            freshest_news_age_hours=round(age_hours, 1),
            sources_used=sources,
        )
