"""News API clients for fetching crypto headlines + summaries.

Supports:
  - Alpha Vantage NEWS_SENTIMENT (free, 5 req/min, has sentiment scores)
  - NewsAPI (free, 100 req/day, 24h delay on free tier — good for backtest)
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone

import requests

__all__ = ["AlpacaNews", "AlphaVantageNews", "NewsAPIClient", "NewsItem"]


@dataclass(frozen=True, slots=True)
class NewsItem:
    """A single news article with headline, summary, and optional pre-scored sentiment."""

    title: str
    summary: str
    source: str
    published_at: datetime
    url: str = ""
    # Alpha Vantage provides these; NewsAPI does not
    av_sentiment_score: float | None = None  # -1.0 to 1.0
    av_sentiment_label: str | None = None  # Bearish / Somewhat-Bearish / Neutral / ...
    av_relevance: float | None = None  # 0.0 to 1.0 (how relevant to the ticker)


class AlphaVantageNews:
    """Alpha Vantage NEWS_SENTIMENT endpoint.

    Free tier: 25 req/day (standard key). Premium keys get more.
    Returns headlines + summaries + pre-computed sentiment scores per ticker.
    """

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("ALPHA_VANTAGE_API_KEY", "")
        if not self.api_key:
            raise ValueError(
                "Alpha Vantage API key required. "
                "Set ALPHA_VANTAGE_API_KEY env var or pass api_key=."
            )
        self._last_call: float = 0.0

    def _rate_limit(self) -> None:
        """Enforce 5 req/min (12s between calls)."""
        elapsed = time.monotonic() - self._last_call
        if elapsed < 12.0:
            time.sleep(12.0 - elapsed)
        self._last_call = time.monotonic()

    def fetch(
        self,
        tickers: str = "CRYPTO:BTC",
        limit: int = 50,
        time_from: str | None = None,
        sort: str = "LATEST",
    ) -> list[NewsItem]:
        """Fetch news articles with sentiment for given tickers.

        Args:
            tickers: Comma-separated ticker list (e.g. "CRYPTO:BTC,CRYPTO:ETH").
            limit: Max articles to return (API max 1000).
            time_from: Optional start time as "YYYYMMDDTHHMM" string.
            sort: "LATEST" or "EARLIEST" or "RELEVANCE".

        Returns:
            List of NewsItem with headlines, summaries, and AV sentiment scores.
        """
        self._rate_limit()

        params: dict = {
            "function": "NEWS_SENTIMENT",
            "tickers": tickers,
            "limit": min(limit, 1000),
            "sort": sort,
            "apikey": self.api_key,
        }
        if time_from:
            params["time_from"] = time_from

        resp = requests.get(self.BASE_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if "Error Message" in data:
            raise RuntimeError(f"Alpha Vantage error: {data['Error Message']}")
        if "Note" in data:
            raise RuntimeError(f"Alpha Vantage rate limit: {data['Note']}")

        items: list[NewsItem] = []
        for article in data.get("feed", []):
            # Find ticker-specific sentiment
            ticker_sentiment = None
            for ts in article.get("ticker_sentiment", []):
                if ts.get("ticker") in tickers.split(","):
                    ticker_sentiment = ts
                    break

            published = datetime.strptime(
                article["time_published"], "%Y%m%dT%H%M%S"
            ).replace(tzinfo=timezone.utc)

            items.append(
                NewsItem(
                    title=article.get("title", ""),
                    summary=article.get("summary", ""),
                    source=article.get("source", ""),
                    published_at=published,
                    url=article.get("url", ""),
                    av_sentiment_score=(
                        float(ticker_sentiment["ticker_sentiment_score"])
                        if ticker_sentiment
                        else float(article.get("overall_sentiment_score", 0))
                    ),
                    av_sentiment_label=(
                        ticker_sentiment.get("ticker_sentiment_label")
                        if ticker_sentiment
                        else article.get("overall_sentiment_label")
                    ),
                    av_relevance=(
                        float(ticker_sentiment["relevance_score"])
                        if ticker_sentiment
                        else None
                    ),
                )
            )

        return items[:limit]


class NewsAPIClient:
    """NewsAPI.org client for general crypto news.

    Free tier: 100 req/day, articles delayed 24h.
    No sentiment scores — headlines + descriptions only.
    Best for backtesting with historical data.
    """

    BASE_URL = "https://newsapi.org/v2"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("NEWSAPI_KEY", "")
        if not self.api_key:
            raise ValueError(
                "NewsAPI key required. Set NEWSAPI_KEY env var or pass api_key=."
            )

    def fetch(
        self,
        query: str = "bitcoin OR BTC OR crypto",
        language: str = "en",
        page_size: int = 50,
        sort_by: str = "publishedAt",
    ) -> list[NewsItem]:
        """Fetch news articles matching query.

        Args:
            query: Search query string.
            language: ISO 639-1 language code.
            page_size: Number of articles (max 100 on free tier).
            sort_by: "publishedAt", "relevancy", or "popularity".

        Returns:
            List of NewsItem (no sentiment scores — LLM will score these).
        """
        resp = requests.get(
            f"{self.BASE_URL}/everything",
            params={
                "q": query,
                "language": language,
                "pageSize": min(page_size, 100),
                "sortBy": sort_by,
                "apiKey": self.api_key,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "ok":
            raise RuntimeError(f"NewsAPI error: {data.get('message', 'unknown')}")

        items: list[NewsItem] = []
        for article in data.get("articles", []):
            published_str = article.get("publishedAt", "")
            try:
                published = datetime.fromisoformat(
                    published_str.replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                published = datetime.now(timezone.utc)

            items.append(
                NewsItem(
                    title=article.get("title", ""),
                    summary=article.get("description", "") or "",
                    source=article.get("source", {}).get("name", ""),
                    published_at=published,
                    url=article.get("url", ""),
                )
            )

        return items


class AlpacaNews:
    """Alpaca News API client.

    Uses existing Alpaca trading credentials — no extra API key needed.
    Returns headlines + summaries for BTC/crypto news.
    """

    BASE_URL = "https://data.alpaca.markets/v1beta1/news"

    def __init__(self, api_key: str | None = None, api_secret: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("ALPACA_API_KEY", "")
        self.api_secret = api_secret or os.environ.get("ALPACA_API_SECRET", "")
        if not self.api_key or not self.api_secret:
            raise ValueError(
                "Alpaca API credentials required. "
                "Set ALPACA_API_KEY + ALPACA_API_SECRET env vars."
            )

    def fetch(
        self,
        symbols: str = "BTC/USD",
        limit: int = 20,
        sort: str = "desc",
    ) -> list[NewsItem]:
        """Fetch news articles for given symbols.

        Args:
            symbols: Comma-separated symbol list (e.g. \"BTC/USD,ETH/USD\").
            limit: Max articles to return (max 50).
            sort: \"desc\" (newest first) or \"asc\".

        Returns:
            List of NewsItem with headlines and summaries.
        """
        resp = requests.get(
            self.BASE_URL,
            params={
                "symbols": symbols,
                "limit": min(limit, 50),
                "sort": sort,
            },
            headers={
                "APCA-API-KEY-ID": self.api_key,
                "APCA-API-SECRET-KEY": self.api_secret,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        items: list[NewsItem] = []
        for article in data.get("news", []):
            published_str = article.get("created_at", "")
            try:
                published = datetime.fromisoformat(
                    published_str.replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                published = datetime.now(timezone.utc)

            items.append(
                NewsItem(
                    title=article.get("headline", ""),
                    summary=article.get("summary", "") or "",
                    source=article.get("source", ""),
                    published_at=published,
                    url=article.get("url", ""),
                )
            )

        return items
