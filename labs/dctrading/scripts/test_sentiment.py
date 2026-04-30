#!/usr/bin/env python3
"""Quick test script for the sentiment confidence scoring pipeline.

Usage:
    # With real API keys (live test):
    ALPHA_VANTAGE_API_KEY=xxx GEMINI_API_KEY=xxx python scripts/test_sentiment.py

    # Dry run with mock data (no API keys needed):
    python scripts/test_sentiment.py --mock
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone

from dctrading.sentiment.llm_scorer import LLMScorer, SentimentResult
from dctrading.sentiment.news_client import AlphaVantageNews, NewsItem


def mock_news_items() -> list[NewsItem]:
    """Generate realistic mock news items for testing without API keys."""
    now = datetime.now(timezone.utc)
    return [
        NewsItem(
            title="Bitcoin Surges Past $95K as Institutional Inflows Hit Record $2.1B Weekly",
            summary="BlackRock's IBIT ETF led the charge with $1.2B in single-day inflows, "
            "pushing BTC to new highs. Analysts cite post-halving supply squeeze.",
            source="CoinDesk",
            published_at=now - timedelta(minutes=30),
            url="https://example.com/1",
        ),
        NewsItem(
            title="Fed Holds Rates Steady, Signals Potential Cut in September",
            summary="The Federal Reserve kept rates unchanged at 5.25-5.50% but Chair Powell "
            "hinted at a September cut if inflation continues cooling. Risk assets rallied.",
            source="Reuters",
            published_at=now - timedelta(hours=1),
            url="https://example.com/2",
        ),
        NewsItem(
            title="Tether Mints $1B USDT on Ethereum, Largest Single Mint in 2026",
            summary="On-chain data shows Tether minted 1 billion USDT, typically a bullish "
            "signal indicating incoming buy pressure from institutional desks.",
            source="The Block",
            published_at=now - timedelta(hours=2),
            url="https://example.com/3",
        ),
        NewsItem(
            title="SEC Approves Spot Ethereum ETF Applications from Fidelity and Ark",
            summary="The SEC greenlit two more spot ETH ETFs, following the success of BTC ETFs. "
            "Market participants expect positive spillover into Bitcoin.",
            source="Bloomberg",
            published_at=now - timedelta(hours=3),
            url="https://example.com/4",
        ),
        NewsItem(
            title="MicroStrategy Announces Additional $500M Bitcoin Purchase",
            summary="Michael Saylor's firm added another 5,200 BTC at an average price of $96,150, "
            "bringing total holdings to 252,000 BTC worth $24.2B.",
            source="CNBC",
            published_at=now - timedelta(hours=4),
            url="https://example.com/5",
        ),
        NewsItem(
            title="Bitcoin Mining Difficulty Reaches All-Time High After Halving Adjustment",
            summary="Mining difficulty increased 3.2% to a record 92.7T, squeezing smaller miners. "
            "Hash rate remains strong at 650 EH/s despite reduced block rewards.",
            source="CoinTelegraph",
            published_at=now - timedelta(hours=5),
            url="https://example.com/6",
        ),
        NewsItem(
            title="Binance Reports Record Q1 Trading Volume of $4.6 Trillion",
            summary="The exchange saw a 45% increase in spot volume and 62% in derivatives, "
            "driven by BTC ETF arbitrage and altcoin season momentum.",
            source="The Block",
            published_at=now - timedelta(hours=6),
            url="https://example.com/7",
        ),
    ]


def test_mock_llm(items: list[NewsItem]) -> None:
    """Test LLM scoring with mock data (requires GEMINI_API_KEY)."""
    import os

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[SKIP] LLM scoring — no GEMINI_API_KEY set")
        print("  Set GEMINI_API_KEY to test LLM scoring with mock headlines")
        return

    print("\n--- LLM Scoring (mock headlines → real LLM) ---")
    scorer = LLMScorer()
    result = scorer.score(items)

    print(f"  Sentiment:    {result.sentiment}")
    print(f"  Confidence:   {result.confidence:.2f}")
    print(f"  Materiality:  {result.materiality:.2f}")
    print(f"  Direction:    {result.directional_score:+.3f}")
    print(f"  Key factors:  {result.key_factors}")
    print(f"  Reasoning:    {result.reasoning}")
    print(f"  Tokens:       {result.prompt_tokens} in / {result.completion_tokens} out")
    cost = (result.prompt_tokens * 0.075 + result.completion_tokens * 0.30) / 1_000_000
    print(f"  Est. cost:    ${cost:.6f}")


def test_alpha_vantage() -> list[NewsItem]:
    """Test Alpha Vantage news fetch (requires ALPHA_VANTAGE_API_KEY)."""
    import os

    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        print("\n[SKIP] Alpha Vantage — no ALPHA_VANTAGE_API_KEY set")
        return []

    print("\n--- Alpha Vantage News Fetch ---")
    client = AlphaVantageNews()
    items = client.fetch(tickers="CRYPTO:BTC", limit=10)

    for item in items[:5]:
        age_h = (datetime.now(timezone.utc) - item.published_at).total_seconds() / 3600
        print(f"  [{item.source}] ({age_h:.1f}h ago) {item.title[:80]}")
        if item.av_sentiment_score is not None:
            print(f"    AV sentiment: {item.av_sentiment_score:+.4f} ({item.av_sentiment_label})")

    print(f"  Total: {len(items)} articles fetched")
    return items


def test_full_pipeline() -> None:
    """Test the full SentimentConfidence pipeline (requires AV + Gemini keys)."""
    import os

    av_key = os.environ.get("ALPHA_VANTAGE_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    if not av_key or not gemini_key:
        print("\n[SKIP] Full pipeline — need both ALPHA_VANTAGE_API_KEY and GEMINI_API_KEY")
        return

    print("\n--- Full Confidence Pipeline ---")
    from dctrading.sentiment.confidence import SentimentConfidence

    scorer = SentimentConfidence()
    result = scorer.evaluate()

    print(f"  Trade confidence: {result.trade_confidence:.3f}")
    print(f"  Direction:        {result.direction}")
    print(f"  Should trade:     {result.should_trade}")
    print(f"  Full position:    {result.full_position}")
    print(f"  Position scale:   {result.position_scale}")
    print(f"  News count:       {result.news_count}")
    print(f"  Freshest news:    {result.freshest_news_age_hours:.1f}h ago")
    print(f"  AV avg sentiment: {result.av_sentiment_avg}")
    print(f"  Sources:          {result.sources_used}")
    print(f"  LLM reasoning:    {result.llm_result.reasoning}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Test sentiment scoring pipeline")
    parser.add_argument(
        "--mock", action="store_true", help="Use mock data (no news API key needed)"
    )
    args = parser.parse_args()

    print("=" * 60)
    print("DC Trading — Sentiment Confidence Scorer Test")
    print("=" * 60)

    if args.mock:
        print("\nMode: MOCK (synthetic headlines)")
        items = mock_news_items()
        print(f"\nGenerated {len(items)} mock news items:")
        for item in items:
            age_h = (datetime.now(timezone.utc) - item.published_at).total_seconds() / 3600
            print(f"  [{item.source}] ({age_h:.1f}h ago) {item.title[:80]}")

        test_mock_llm(items)
    else:
        print("\nMode: LIVE (real API calls)")
        av_items = test_alpha_vantage()
        if av_items:
            test_mock_llm(av_items)
        test_full_pipeline()

    print("\n" + "=" * 60)
    print("Done.")


if __name__ == "__main__":
    main()
