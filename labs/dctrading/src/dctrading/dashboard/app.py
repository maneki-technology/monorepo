"""DC Trading monitoring dashboard.

Single-page Streamlit app that reads from the SQLite state store
and displays live trading metrics, charts, positions, trade history,
and DC events.

Run with::

    streamlit run src/dctrading/dashboard/app.py
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

__all__ = ["DashboardData", "main"]

# ---------------------------------------------------------------------------
# Color palette — dark-friendly trading aesthetic
# ---------------------------------------------------------------------------
GREEN = "#00C853"
RED = "#FF1744"
NEUTRAL = "#90A4AE"
BG_CARD = "#1A1D23"
BG_SURFACE = "#0E1117"
ACCENT_CYAN = "#00E5FF"
ACCENT_AMBER = "#FFD740"
TEXT_PRIMARY = "#E0E0E0"
TEXT_DIM = "#607D8B"


# ---------------------------------------------------------------------------
# DashboardData — thin wrapper around sqlite3 queries
# ---------------------------------------------------------------------------
class DashboardData:
    """Read-only accessor for the DC trading SQLite state store."""

    def __init__(self, db_path: str) -> None:
        self.db_path = db_path

    @property
    def db_exists(self) -> bool:
        """Return *True* if the database file exists on disk."""
        return Path(self.db_path).exists()

    def _connect(self) -> sqlite3.Connection:
        """Open a read-only WAL-compatible connection."""
        conn = sqlite3.connect(
            f"file:{self.db_path}?mode=ro",
            uri=True,
            timeout=5,
        )
        conn.row_factory = sqlite3.Row
        return conn

    def _query(self, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
        """Execute *sql* and return rows as a list of dicts."""
        conn = self._connect()
        try:
            rows = conn.execute(sql, params).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # -- public API --------------------------------------------------------

    def get_positions(self) -> list[dict[str, Any]]:
        """Return all open positions."""
        return self._query("SELECT * FROM positions ORDER BY symbol")

    def get_recent_trades(self, limit: int = 50) -> pd.DataFrame:
        """Return the most recent *limit* trades as a DataFrame."""
        rows = self._query(
            "SELECT * FROM trades ORDER BY exit_time DESC LIMIT ?",
            (limit,),
        )
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        if "exit_time" in df.columns:
            df["exit_time"] = pd.to_datetime(df["exit_time"], unit="s", utc=True)
        if "entry_time" in df.columns:
            df["entry_time"] = pd.to_datetime(df["entry_time"], unit="s", utc=True)
        if "pnl" in df.columns and "entry_price" in df.columns:
            df["return_pct"] = (
                df["pnl"] / (df["entry_price"] * df.get("size", 1))
            ).fillna(0) * 100
        return df

    def get_recent_dc_events(self, limit: int = 50) -> pd.DataFrame:
        """Return the most recent *limit* DC events as a DataFrame."""
        rows = self._query(
            "SELECT * FROM dc_events ORDER BY confirm_time DESC LIMIT ?",
            (limit,),
        )
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        for col in ("extreme_time", "confirm_time"):
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], unit="s", utc=True)
        if "extreme_price" in df.columns and "confirm_price" in df.columns:
            df["magnitude"] = (
                (df["confirm_price"] - df["extreme_price"]).abs()
                / df["extreme_price"]
                * 100
            )
        return df

    def get_daily_pnl(self) -> dict[str, Any]:
        """Return today's PnL summary."""
        today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        rows = self._query(
            "SELECT * FROM daily_pnl WHERE date = ?",
            (today,),
        )
        if rows:
            return rows[0]
        return {"date": today, "pnl": 0.0, "num_trades": 0}

    def get_cumulative_pnl(self) -> pd.DataFrame:
        """Return cumulative PnL series across all recorded days."""
        rows = self._query("SELECT date, pnl FROM daily_pnl ORDER BY date")
        if not rows:
            return pd.DataFrame(columns=["date", "pnl", "cumulative_pnl"])
        df = pd.DataFrame(rows)
        df["date"] = pd.to_datetime(df["date"])
        df["cumulative_pnl"] = df["pnl"].cumsum()
        return df

    def get_trade_stats(self) -> dict[str, Any]:
        """Compute aggregate trade statistics."""
        rows = self._query(
            "SELECT "
            "  COUNT(*) AS total, "
            "  SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) AS wins, "
            "  SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) AS losses, "
            "  SUM(pnl) AS total_pnl "
            "FROM trades"
        )
        if rows and rows[0]["total"]:
            r = rows[0]
            total = r["total"] or 0
            wins = r["wins"] or 0
            return {
                "total": total,
                "wins": wins,
                "losses": r["losses"] or 0,
                "total_pnl": r["total_pnl"] or 0.0,
                "win_rate": (wins / total * 100) if total else 0.0,
            }
        return {
            "total": 0,
            "wins": 0,
            "losses": 0,
            "total_pnl": 0.0,
            "win_rate": 0.0,
        }

    def get_strategy_results(self) -> pd.DataFrame:
        """Return all strategy comparison results."""
        try:
            rows = self._query(
                "SELECT agent, threshold, stop_loss, "
                "train_return_pct, train_trades, train_sharpe, "
                "pnl, return_pct, num_trades, win_rate, sharpe_ratio, "
                "holds, total_events "
                "FROM strategy_results ORDER BY sharpe_ratio DESC"
            )
        except Exception:
            return pd.DataFrame()
        if not rows:
            return pd.DataFrame()
        return pd.DataFrame(rows)

    def get_strategies(self) -> list[str]:
        """Return list of available strategy names."""
        try:
            rows = self._query("SELECT DISTINCT strategy FROM strategy_trades ORDER BY strategy")
            return [r["strategy"] for r in rows]
        except Exception:
            return []

    def get_strategy_trades(self, strategy: str, limit: int = 100) -> pd.DataFrame:
        """Return trades for a specific strategy."""
        rows = self._query(
            "SELECT * FROM strategy_trades WHERE strategy = ? ORDER BY exit_time DESC LIMIT ?",
            (strategy, limit),
        )
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        if "exit_time" in df.columns:
            df["exit_time_dt"] = pd.to_datetime(df["exit_time"], unit="s", utc=True)
        if "entry_time" in df.columns:
            df["entry_time_dt"] = pd.to_datetime(df["entry_time"], unit="s", utc=True)
        if "pnl" in df.columns and "entry_price" in df.columns:
            df["return_pct"] = (df["pnl"] / (df["entry_price"] * df.get("size", 1))).fillna(0) * 100
        return df

    def get_strategy_stats(self, strategy: str) -> dict[str, Any]:
        """Compute stats for a specific strategy."""
        rows = self._query(
            "SELECT COUNT(*) AS total, "
            "SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) AS wins, "
            "SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) AS losses, "
            "SUM(pnl) AS total_pnl "
            "FROM strategy_trades WHERE strategy = ?",
            (strategy,),
        )
        if rows and rows[0]["total"]:
            r = rows[0]
            total = r["total"] or 0
            wins = r["wins"] or 0
            return {"total": total, "wins": wins, "losses": r["losses"] or 0,
                    "total_pnl": r["total_pnl"] or 0.0,
                    "win_rate": (wins / total * 100) if total else 0.0}
        return {"total": 0, "wins": 0, "losses": 0, "total_pnl": 0.0, "win_rate": 0.0}

    def get_strategy_trades_for_chart(self, strategy: str) -> pd.DataFrame:
        """Return trades for price chart overlay."""
        rows = self._query(
            "SELECT entry_price, entry_time, exit_price, exit_time, side, pnl "
            "FROM strategy_trades WHERE strategy = ? ORDER BY entry_time",
            (strategy,),
        )
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        df["entry_time"] = pd.to_datetime(df["entry_time"], unit="s", utc=True)
        df["exit_time"] = pd.to_datetime(df["exit_time"], unit="s", utc=True)
        return df

    def get_strategy_win_loss(self, strategy: str) -> dict[str, Any]:
        """Win/loss analysis for a specific strategy."""
        rows = self._query(
            "SELECT pnl, entry_price, exit_price, entry_time, exit_time, size, side "
            "FROM strategy_trades WHERE strategy = ? ORDER BY exit_time",
            (strategy,),
        )
        if not rows:
            return {"avg_win": 0.0, "avg_loss": 0.0, "payoff_ratio": 0.0,
                    "largest_win": 0.0, "largest_loss": 0.0,
                    "avg_hold_win_h": 0.0, "avg_hold_loss_h": 0.0,
                    "pnl_buckets": [], "monthly": []}
        wins = [r for r in rows if r["pnl"] > 0]
        losses = [r for r in rows if r["pnl"] <= 0]
        avg_win = sum(r["pnl"] for r in wins) / len(wins) if wins else 0.0
        avg_loss = sum(r["pnl"] for r in losses) / len(losses) if losses else 0.0
        payoff = abs(avg_win / avg_loss) if avg_loss != 0 else 0.0
        avg_hold_win = (sum(r["exit_time"] - r["entry_time"] for r in wins) / len(wins) / 3600) if wins else 0.0
        avg_hold_loss = (sum(r["exit_time"] - r["entry_time"] for r in losses) / len(losses) / 3600) if losses else 0.0
        bucket_edges = [(-1e9, -500), (-500, -200), (-200, -50), (-50, 0), (0, 50), (50, 200), (200, 500), (500, 1e9)]
        bucket_labels = ["< -$500", "-$500 to -$200", "-$200 to -$50", "-$50 to $0", "$0 to $50", "$50 to $200", "$200 to $500", "> $500"]
        buckets = []
        for (lo, hi), label in zip(bucket_edges, bucket_labels):
            count = sum(1 for r in rows if lo <= r["pnl"] < hi)
            buckets.append({"label": label, "count": count, "lo": lo, "hi": hi})
        monthly_map: dict[str, dict] = {}
        for r in rows:
            from datetime import datetime, timezone as tz
            month = datetime.fromtimestamp(r["exit_time"], tz=tz.utc).strftime("%Y-%m")
            if month not in monthly_map:
                monthly_map[month] = {"month": month, "pnl": 0.0, "trades": 0, "wins": 0}
            monthly_map[month]["pnl"] += r["pnl"]
            monthly_map[month]["trades"] += 1
            if r["pnl"] > 0:
                monthly_map[month]["wins"] += 1
        monthly = sorted(monthly_map.values(), key=lambda x: x["month"])
        return {"avg_win": avg_win, "avg_loss": avg_loss, "payoff_ratio": payoff,
                "largest_win": max((r["pnl"] for r in wins), default=0.0),
                "largest_loss": min((r["pnl"] for r in losses), default=0.0),
                "avg_hold_win_h": avg_hold_win, "avg_hold_loss_h": avg_hold_loss,
                "pnl_buckets": buckets, "monthly": monthly}
    def get_price_and_trades(self) -> tuple[pd.DataFrame, pd.DataFrame]:
        """Return DC event prices and trade entry/exit points for charting."""
        # Build price series from DC events (extreme + confirm points)
        event_rows = self._query(
            "SELECT extreme_price, extreme_time, confirm_price, confirm_time, direction "
            "FROM dc_events ORDER BY confirm_time"
        )
        price_points = []
        for r in event_rows:
            price_points.append({"time": r["extreme_time"], "price": r["extreme_price"]})
            price_points.append({"time": r["confirm_time"], "price": r["confirm_price"]})
        price_df = pd.DataFrame(price_points)
        if not price_df.empty:
            price_df = price_df.drop_duplicates(subset="time").sort_values("time")
            price_df["time"] = pd.to_datetime(price_df["time"], unit="s", utc=True)

        # Trade entries and exits
        trade_rows = self._query(
            "SELECT entry_price, entry_time, exit_price, exit_time, side, pnl "
            "FROM trades ORDER BY entry_time"
        )
        trades_df = pd.DataFrame(trade_rows) if trade_rows else pd.DataFrame()
        if not trades_df.empty:
            trades_df["entry_time"] = pd.to_datetime(trades_df["entry_time"], unit="s", utc=True)
            trades_df["exit_time"] = pd.to_datetime(trades_df["exit_time"], unit="s", utc=True)

        return price_df, trades_df
    def get_win_loss_analysis(self) -> dict[str, Any]:
        """Compute detailed win/loss breakdown."""
        rows = self._query(
            "SELECT pnl, entry_price, exit_price, entry_time, exit_time, size, side "
            "FROM trades ORDER BY exit_time"
        )
        if not rows:
            return {
                "avg_win": 0.0, "avg_loss": 0.0, "payoff_ratio": 0.0,
                "largest_win": 0.0, "largest_loss": 0.0,
                "avg_hold_win_h": 0.0, "avg_hold_loss_h": 0.0,
                "pnl_buckets": [], "monthly": [],
            }

        wins = [r for r in rows if r["pnl"] > 0]
        losses = [r for r in rows if r["pnl"] <= 0]
        avg_win = sum(r["pnl"] for r in wins) / len(wins) if wins else 0.0
        avg_loss = sum(r["pnl"] for r in losses) / len(losses) if losses else 0.0
        payoff = abs(avg_win / avg_loss) if avg_loss != 0 else 0.0

        avg_hold_win = (sum(r["exit_time"] - r["entry_time"] for r in wins) / len(wins) / 3600) if wins else 0.0
        avg_hold_loss = (sum(r["exit_time"] - r["entry_time"] for r in losses) / len(losses) / 3600) if losses else 0.0

        # PnL distribution buckets
        bucket_edges = [(-1e9, -500), (-500, -200), (-200, -50), (-50, 0), (0, 50), (50, 200), (200, 500), (500, 1e9)]
        bucket_labels = ["< -$500", "-$500 to -$200", "-$200 to -$50", "-$50 to $0", "$0 to $50", "$50 to $200", "$200 to $500", "> $500"]
        buckets = []
        for (lo, hi), label in zip(bucket_edges, bucket_labels):
            count = sum(1 for r in rows if lo <= r["pnl"] < hi)
            buckets.append({"label": label, "count": count, "lo": lo, "hi": hi})

        # Monthly breakdown
        monthly_map: dict[str, dict] = {}
        for r in rows:
            from datetime import datetime, timezone as tz
            month = datetime.fromtimestamp(r["exit_time"], tz=tz.utc).strftime("%Y-%m")
            if month not in monthly_map:
                monthly_map[month] = {"month": month, "pnl": 0.0, "trades": 0, "wins": 0}
            monthly_map[month]["pnl"] += r["pnl"]
            monthly_map[month]["trades"] += 1
            if r["pnl"] > 0:
                monthly_map[month]["wins"] += 1

        monthly = sorted(monthly_map.values(), key=lambda x: x["month"])

        return {
            "avg_win": avg_win, "avg_loss": avg_loss, "payoff_ratio": payoff,
            "largest_win": max((r["pnl"] for r in wins), default=0.0),
            "largest_loss": min((r["pnl"] for r in losses), default=0.0),
            "avg_hold_win_h": avg_hold_win, "avg_hold_loss_h": avg_hold_loss,
            "pnl_buckets": buckets, "monthly": monthly,
        }
    def get_risk_status(self) -> dict[str, Any]:
        """Derive risk status from positions and daily PnL."""
        daily = self.get_daily_pnl()
        positions = self.get_positions()
        total_exposure = sum(
            abs(p.get("size", 0) * p.get("entry_price", 0)) for p in positions
        )
        return {
            "daily_pnl": daily.get("pnl", 0.0),
            "num_positions": len(positions),
            "total_exposure": total_exposure,
        }


# ---------------------------------------------------------------------------
# Cached data loaders
# ---------------------------------------------------------------------------
@st.cache_data(ttl=5)
def load_positions(db_path: str) -> list[dict[str, Any]]:
    """Load positions with 5-second cache."""
    return DashboardData(db_path).get_positions()


@st.cache_data(ttl=5)
def load_recent_trades(db_path: str, limit: int = 50) -> pd.DataFrame:
    """Load recent trades with 5-second cache."""
    return DashboardData(db_path).get_recent_trades(limit)


@st.cache_data(ttl=5)
def load_recent_dc_events(db_path: str, limit: int = 50) -> pd.DataFrame:
    """Load recent DC events with 5-second cache."""
    return DashboardData(db_path).get_recent_dc_events(limit)


@st.cache_data(ttl=5)
def load_daily_pnl(db_path: str) -> dict[str, Any]:
    """Load today's PnL with 5-second cache."""
    return DashboardData(db_path).get_daily_pnl()


@st.cache_data(ttl=5)
def load_cumulative_pnl(db_path: str) -> pd.DataFrame:
    """Load cumulative PnL series with 5-second cache."""
    return DashboardData(db_path).get_cumulative_pnl()


@st.cache_data(ttl=5)
def load_trade_stats(db_path: str) -> dict[str, Any]:
    """Load trade statistics with 5-second cache."""
    return DashboardData(db_path).get_trade_stats()


@st.cache_data(ttl=5)
def load_risk_status(db_path: str) -> dict[str, Any]:
    """Load risk status with 5-second cache."""
    return DashboardData(db_path).get_risk_status()


@st.cache_data(ttl=5)
def load_win_loss_analysis(db_path: str) -> dict[str, Any]:
    """Load win/loss analysis with 5-second cache."""
    return DashboardData(db_path).get_win_loss_analysis()


@st.cache_data(ttl=5)
def load_strategy_results(db_path: str) -> pd.DataFrame:
    """Load strategy comparison results."""
    return DashboardData(db_path).get_strategy_results()

@st.cache_data(ttl=60)
def load_price_data() -> pd.DataFrame:
    """Load hourly price data from cached parquet files (2025 + 2026)."""
    from pathlib import Path
    cache_dir = Path("data/cache")
    files = sorted(cache_dir.glob("BTC_USDT_1h_202*"))
    if not files:
        return pd.DataFrame()
    dfs = [pd.read_parquet(f) for f in files]
    df = pd.concat(dfs).drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    df["time"] = pd.to_datetime(df["timestamp"], unit="s", utc=True)
    return df[["time", "open", "high", "low", "close", "volume"]]


@st.cache_data(ttl=5)
def load_trades_for_chart(db_path: str) -> pd.DataFrame:
    """Load all trades with entry/exit times and prices."""
    db = DashboardData(db_path)
    rows = db._query(
        "SELECT entry_price, entry_time, exit_price, exit_time, side, pnl "
        "FROM trades ORDER BY entry_time"
    )
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)
    df["entry_time"] = pd.to_datetime(df["entry_time"], unit="s", utc=True)
    df["exit_time"] = pd.to_datetime(df["exit_time"], unit="s", utc=True)
    return df
# ---------------------------------------------------------------------------
# Chart builders
# ---------------------------------------------------------------------------
_PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color=TEXT_PRIMARY, family="JetBrains Mono, Fira Code, monospace"),
    margin=dict(l=40, r=20, t=40, b=40),
    xaxis=dict(gridcolor="#263238", zerolinecolor="#37474F"),
    yaxis=dict(gridcolor="#263238", zerolinecolor="#37474F"),
)


def build_price_chart_with_trades(price_df: pd.DataFrame, trades_df: pd.DataFrame) -> go.Figure:
    """Build a price line chart with trade entry/exit markers overlaid."""
    fig = go.Figure()
    if price_df.empty:
        fig.update_layout(**_PLOTLY_LAYOUT, title="BTC/USDT Price + Trades", height=500)
        return fig

    # Price line
    fig.add_trace(go.Scatter(
        x=price_df["time"], y=price_df["close"],
        mode="lines", name="BTC/USDT",
        line=dict(color=NEUTRAL, width=1.5),
    ))

    if not trades_df.empty:
        # Entry markers
        for _, t in trades_df.iterrows():
            is_long = str(t["side"]).upper() in ("UP", "BUY")
            win = t["pnl"] > 0

            # Entry arrow
            fig.add_trace(go.Scatter(
                x=[t["entry_time"]], y=[t["entry_price"]],
                mode="markers",
                marker=dict(
                    symbol="triangle-up" if is_long else "triangle-down",
                    size=12, color=GREEN if is_long else RED,
                    line=dict(width=1, color="white"),
                ),
                name="", showlegend=False,
                hovertemplate=(
                    f"{'BUY' if is_long else 'SELL'} @ ${t['entry_price']:,.0f}<br>"
                    f"{t['entry_time'].strftime('%Y-%m-%d %H:%M')}<extra></extra>"
                ),
            ))

            # Exit marker
            fig.add_trace(go.Scatter(
                x=[t["exit_time"]], y=[t["exit_price"]],
                mode="markers",
                marker=dict(
                    symbol="x", size=10,
                    color=GREEN if win else RED,
                    line=dict(width=2, color=GREEN if win else RED),
                ),
                name="", showlegend=False,
                hovertemplate=(
                    f"EXIT @ ${t['exit_price']:,.0f}<br>"
                    f"PnL: ${t['pnl']:+,.0f}<br>"
                    f"{t['exit_time'].strftime('%Y-%m-%d %H:%M')}<extra></extra>"
                ),
            ))

            # Line connecting entry to exit
            fig.add_trace(go.Scatter(
                x=[t["entry_time"], t["exit_time"]],
                y=[t["entry_price"], t["exit_price"]],
                mode="lines",
                line=dict(color=GREEN if win else RED, width=1.5, dash="dot"),
                name="", showlegend=False, hoverinfo="skip",
            ))

    fig.update_layout(
        **_PLOTLY_LAYOUT,
        title="BTC/USDT 2025 — Price + Trades",
        height=500,
        yaxis_title="Price ($)",
        showlegend=False,
        hovermode="closest",
    )
    return fig

def build_cumulative_pnl_chart(df: pd.DataFrame) -> go.Figure:
    """Build a cumulative PnL line chart."""
    fig = go.Figure()
    if df.empty:
        fig.update_layout(
            **_PLOTLY_LAYOUT,
            title="Cumulative PnL",
            height=340,
        )
        return fig

    colors = [GREEN if v >= 0 else RED for v in df["cumulative_pnl"]]
    fig.add_trace(
        go.Scatter(
            x=df["date"],
            y=df["cumulative_pnl"],
            mode="lines+markers",
            line=dict(color=ACCENT_CYAN, width=2),
            marker=dict(color=colors, size=5),
            fill="tozeroy",
            fillcolor="rgba(0,229,255,0.08)",
            name="Cumulative PnL",
        )
    )
    fig.update_layout(
        **_PLOTLY_LAYOUT,
        title="Cumulative PnL",
        height=340,
        yaxis_title="PnL ($)",
        showlegend=False,
    )
    return fig


def build_win_loss_chart(stats: dict[str, Any]) -> go.Figure:
    """Build a wins vs losses bar chart."""
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=["Wins", "Losses"],
            y=[stats["wins"], stats["losses"]],
            marker_color=[GREEN, RED],
            text=[stats["wins"], stats["losses"]],
            textposition="auto",
            textfont=dict(size=16, color=TEXT_PRIMARY),
        )
    )
    fig.update_layout(
        **_PLOTLY_LAYOUT,
        title="Trade Distribution",
        height=340,
        yaxis_title="Count",
        showlegend=False,
    )
    return fig


def build_pnl_distribution_chart(buckets: list[dict]) -> go.Figure:
    """Build a PnL distribution histogram."""
    fig = go.Figure()
    if not buckets:
        fig.update_layout(**_PLOTLY_LAYOUT, title="PnL Distribution", height=340)
        return fig
    labels = [b["label"] for b in buckets]
    counts = [b["count"] for b in buckets]
    colors = [RED if b["hi"] <= 0 else GREEN for b in buckets]
    fig.add_trace(go.Bar(
        x=labels, y=counts, marker_color=colors,
        text=counts, textposition="auto",
        textfont=dict(size=14, color=TEXT_PRIMARY),
    ))
    fig.update_layout(**_PLOTLY_LAYOUT, title="PnL Distribution", height=340, yaxis_title="Trades", showlegend=False)
    return fig


def build_monthly_pnl_chart(monthly: list[dict]) -> go.Figure:
    """Build a monthly PnL bar chart with win rate overlay."""
    fig = go.Figure()
    if not monthly:
        fig.update_layout(**_PLOTLY_LAYOUT, title="Monthly Performance", height=340)
        return fig
    months = [m["month"] for m in monthly]
    pnls = [m["pnl"] for m in monthly]
    colors = [GREEN if p >= 0 else RED for p in pnls]
    win_rates = [m["wins"] / m["trades"] * 100 if m["trades"] > 0 else 0 for m in monthly]
    fig.add_trace(go.Bar(
        x=months, y=pnls, marker_color=colors, name="PnL",
        text=[f"${p:+,.0f}" for p in pnls], textposition="auto",
        textfont=dict(size=11, color=TEXT_PRIMARY),
    ))
    fig.add_trace(go.Scatter(
        x=months, y=win_rates, mode="lines+markers", name="Win %",
        yaxis="y2", line=dict(color=ACCENT_AMBER, width=2),
        marker=dict(size=6, color=ACCENT_AMBER),
    ))
    fig.update_layout(
        **_PLOTLY_LAYOUT, title="Monthly Performance", height=340, showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        yaxis_title="PnL ($)",
        yaxis2=dict(title=dict(text="Win %", font=dict(color=ACCENT_AMBER)), overlaying="y", side="right", range=[0, 100],
                    gridcolor="rgba(0,0,0,0)",
                    tickfont=dict(color=ACCENT_AMBER)),
    )
    return fig

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
def render_sidebar() -> tuple[str, bool, int]:
    """Render sidebar controls and return (db_path, auto_refresh, interval)."""
    with st.sidebar:
        st.markdown(
            f'<h2 style="color:{ACCENT_CYAN};margin-bottom:0;">⚙ Config</h2>',
            unsafe_allow_html=True,
        )
        st.divider()

        db_path = st.text_input(
            "Database path",
            value="data/dctrading.db",
            help="Path to the SQLite state store",
        )

        st.divider()
        auto_refresh = st.toggle("Auto-refresh", value=True)
        interval = st.select_slider(
            "Refresh interval",
            options=[5, 10, 30, 60],
            value=10,
            format_func=lambda x: f"{x}s",
            disabled=not auto_refresh,
        )

        st.divider()
        st.markdown(f'<p style="color:{TEXT_DIM};font-size:0.85rem;">Thresholds</p>', unsafe_allow_html=True)
        st.caption("Configured in engine — read-only display")

        st.divider()
        st.markdown(f'<p style="color:{TEXT_DIM};font-size:0.85rem;">Risk Limits</p>', unsafe_allow_html=True)
        st.caption("Max daily drawdown, circuit breaker, position limits")

    return db_path, auto_refresh, int(interval)


def render_strategy_comparison(db_path: str) -> None:
    """Render the strategy comparison table and chart."""
    df = load_strategy_results(db_path)
    if df.empty:
        return

    st.markdown(
        f'<h3 style="color:{ACCENT_AMBER};margin-top:1.5rem;">🏆 Strategy Comparison (Train 2019-2024 / Test 2025)</h3>',
        unsafe_allow_html=True,
    )

    # Format for display
    display_df = df.copy()
    display_df["stop_loss"] = display_df["stop_loss"].apply(lambda x: "none" if x == 0 else f"{x*100:.1f}%")
    display_df["threshold"] = display_df["threshold"].apply(lambda x: "—" if x == 0 else f"{x:.3f}")
    display_df["win_rate"] = display_df["win_rate"].apply(lambda x: f"{x:.0%}")
    display_df["sharpe_ratio"] = display_df["sharpe_ratio"].apply(lambda x: f"{x:.2f}")
    display_df["pnl"] = display_df["pnl"].apply(lambda x: f"${x:+,.0f}")
    display_df["return_pct"] = display_df["return_pct"].apply(lambda x: f"{x:+.1f}%")
    if "train_sharpe" in display_df.columns:
        display_df["train_sharpe"] = display_df["train_sharpe"].apply(lambda x: f"{x:.2f}" if x is not None and x != 0 else "—")
    if "train_return_pct" in display_df.columns:
        display_df["train_return_pct"] = display_df["train_return_pct"].apply(lambda x: f"{x:+.1f}%" if x is not None and x != 0 else "—")

    cols = ["agent", "threshold", "stop_loss"]
    if "train_return_pct" in display_df.columns:
        cols.extend(["train_return_pct", "train_sharpe"])
    cols.extend(["pnl", "return_pct", "num_trades", "win_rate", "sharpe_ratio"])
    display_df = display_df[[c for c in cols if c in display_df.columns]]

    col_names = {"agent": "Agent", "threshold": "λ", "stop_loss": "SL",
                 "train_return_pct": "Train Ret", "train_sharpe": "Train Sharpe",
                 "pnl": "Test PnL", "return_pct": "Test Ret", "num_trades": "Trades",
                 "win_rate": "Win%", "sharpe_ratio": "Test Sharpe"}
    display_df.columns = [col_names.get(c, c) for c in display_df.columns]

    st.dataframe(display_df, use_container_width=True, hide_index=True, height=440)

    # Sharpe ratio grouped bar chart — train vs test
    chart_df = df.copy()
    chart_df["label"] = chart_df.apply(
        lambda r: f"{r['agent']}" + (f" SL={r['stop_loss']*100:.0f}%" if r["stop_loss"] > 0 else ""), axis=1
    )
    has_train = "train_sharpe" in chart_df.columns and chart_df["train_sharpe"].fillna(0).abs().sum() > 0

    fig = go.Figure()
    if has_train:
        fig.add_trace(go.Bar(
            x=chart_df["label"], y=chart_df["train_sharpe"],
            name="Train Sharpe",
            marker_color=[ACCENT_AMBER if s >= 0 else RED for s in chart_df["train_sharpe"]],
            text=[f"{s:.2f}" for s in chart_df["train_sharpe"]],
            textposition="auto", textfont=dict(size=11, color=TEXT_PRIMARY),
            opacity=0.6,
        ))
    fig.add_trace(go.Bar(
        x=chart_df["label"], y=chart_df["sharpe_ratio"],
        name="Test Sharpe",
        marker_color=[GREEN if s >= 0 else RED for s in chart_df["sharpe_ratio"]],
        text=[f"{s:.2f}" for s in chart_df["sharpe_ratio"]],
        textposition="auto", textfont=dict(size=11, color=TEXT_PRIMARY),
    ))
    fig.update_layout(
        **_PLOTLY_LAYOUT,
        title="Sharpe Ratio — Train vs Test",
        height=400,
        yaxis_title="Sharpe Ratio",
        barmode="group",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis_tickangle=-35,
    )
    fig.add_hline(y=0, line_dash="dash", line_color=TEXT_DIM, line_width=1)
    fig.add_hline(y=1, line_dash="dot", line_color=ACCENT_AMBER, line_width=1,
                  annotation_text="Good", annotation_position="right")
    fig.add_hline(y=2, line_dash="dot", line_color=GREEN, line_width=1,
                  annotation_text="Excellent", annotation_position="right")
    st.plotly_chart(fig, use_container_width=True, key="sharpe_comparison")

# ---------------------------------------------------------------------------
# Section renderers
# ---------------------------------------------------------------------------
def render_header(db_exists: bool) -> None:
    """Render the dashboard header with status indicator."""
    now = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    status_color = GREEN if db_exists else RED
    status_text = "● CONNECTED" if db_exists else "● NO DATA"

    st.markdown(
        f"""
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:0.5rem 0 1rem 0;border-bottom:1px solid #263238;margin-bottom:1.5rem;">
            <div>
                <h1 style="margin:0;padding:0;font-size:1.8rem;
                           background:linear-gradient(135deg,{ACCENT_CYAN},{ACCENT_AMBER});
                           -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                           font-family:'JetBrains Mono',monospace;">
                    DC Trading Dashboard
                </h1>
                <p style="margin:0;color:{TEXT_DIM};font-size:0.85rem;font-family:monospace;">{now}</p>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="color:{status_color};font-family:monospace;font-size:0.9rem;
                             text-shadow:0 0 8px {status_color}40;">{status_text}</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpi_row(
    daily: dict[str, Any],
    stats: dict[str, Any],
    positions: list[dict[str, Any]],
) -> None:
    """Render the top KPI metric cards."""
    total_pnl = stats["total_pnl"]
    pnl_color = GREEN if total_pnl >= 0 else RED
    num_trades_today = daily.get("num_trades", 0)
    win_rate = stats["win_rate"]

    # Determine current position label
    if positions:
        pos = positions[0]
        side = str(pos.get("side", "flat")).upper()
        symbol = pos.get("symbol", "")
        pos_label = f"{side} {symbol}"
    else:
        pos_label = "FLAT"

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric(
            label="Total PnL",
            value=f"${total_pnl:,.2f}",
            delta=f"${daily.get('pnl', 0):,.2f} today",
            delta_color="normal",
        )
        st.markdown(
            f'<div style="height:3px;background:{pnl_color};border-radius:2px;margin-top:-8px;"></div>',
            unsafe_allow_html=True,
        )
    with c2:
        st.metric(label="Trades Today", value=str(num_trades_today))
    with c3:
        st.metric(label="Win Rate", value=f"{win_rate:.1f}%")
    with c4:
        st.metric(label="Position", value=pos_label)


def render_charts(db_path: str, stats: dict[str, Any]) -> None:
    """Render the cumulative PnL and win/loss charts."""
    left, right = st.columns(2)
    with left:
        cum_pnl = load_cumulative_pnl(db_path)
        fig_pnl = build_cumulative_pnl_chart(cum_pnl)
        st.plotly_chart(fig_pnl, use_container_width=True, key="chart_cum_pnl")
    with right:
        fig_wl = build_win_loss_chart(stats)
        st.plotly_chart(fig_wl, use_container_width=True, key="chart_win_loss")


def render_win_loss_analysis(db_path: str) -> None:
    """Render the win/loss analysis section."""
    analysis = load_win_loss_analysis(db_path)
    if not analysis["pnl_buckets"] and not analysis["monthly"]:
        return

    st.markdown(
        f'<h3 style="color:{ACCENT_CYAN};margin-top:1.5rem;">🎯 Win/Loss Analysis</h3>',
        unsafe_allow_html=True,
    )

    # Key metrics row
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    with c1:
        st.metric("Avg Win", f"${analysis['avg_win']:+,.2f}")
    with c2:
        st.metric("Avg Loss", f"${analysis['avg_loss']:+,.2f}")
    with c3:
        st.metric("Payoff Ratio", f"{analysis['payoff_ratio']:.2f}x")
    with c4:
        st.metric("Largest Win", f"${analysis['largest_win']:+,.2f}")
    with c5:
        st.metric("Largest Loss", f"${analysis['largest_loss']:+,.2f}")
    with c6:
        win_h = analysis['avg_hold_win_h']
        loss_h = analysis['avg_hold_loss_h']
        st.metric("Avg Hold (W/L)", f"{win_h:.0f}h / {loss_h:.0f}h")

    st.markdown("<div style='height:0.5rem;'></div>", unsafe_allow_html=True)

    # Charts row
    left, right = st.columns(2)
    with left:
        fig_dist = build_pnl_distribution_chart(analysis["pnl_buckets"])
        st.plotly_chart(fig_dist, use_container_width=True)
    with right:
        fig_monthly = build_monthly_pnl_chart(analysis["monthly"])
        st.plotly_chart(fig_monthly, use_container_width=True)

def render_dc_events(db_path: str) -> None:
    """Render the DC events table."""
    st.markdown(
        f'<h3 style="color:{ACCENT_AMBER};margin-top:1.5rem;">⚡ DC Events</h3>',
        unsafe_allow_html=True,
    )
    df = load_recent_dc_events(db_path)
    if df.empty:
        st.info("No DC events recorded yet.")
        return

    display_cols = [
        c
        for c in [
            "confirm_time",
            "symbol",
            "direction",
            "threshold",
            "extreme_price",
            "confirm_price",
            "magnitude",
        ]
        if c in df.columns
    ]
    display_df = df[display_cols].copy()

    # Style direction column
    if "direction" in display_df.columns:
        display_df["direction"] = display_df["direction"].apply(
            lambda d: f"🟢 {d}" if str(d).upper() == "UP" else f"🔴 {d}"
        )

    column_config: dict[str, Any] = {}
    if "threshold" in display_df.columns:
        column_config["threshold"] = st.column_config.NumberColumn(
            "Threshold", format="%.4f"
        )
    if "extreme_price" in display_df.columns:
        column_config["extreme_price"] = st.column_config.NumberColumn(
            "Extreme Price", format="%.2f"
        )
    if "confirm_price" in display_df.columns:
        column_config["confirm_price"] = st.column_config.NumberColumn(
            "Confirm Price", format="%.2f"
        )
    if "magnitude" in display_df.columns:
        column_config["magnitude"] = st.column_config.NumberColumn(
            "Magnitude %", format="%.4f"
        )

    st.dataframe(
        display_df,
        column_config=column_config,
        use_container_width=True,
        hide_index=True,
        height=400,
    )


def render_trade_history(db_path: str) -> None:
    """Render the trade history table."""
    st.markdown(
        f'<h3 style="color:{ACCENT_CYAN};margin-top:1.5rem;">📊 Trade History</h3>',
        unsafe_allow_html=True,
    )
    df = load_recent_trades(db_path)
    if df.empty:
        st.info("No trades recorded yet.")
        return

    display_cols = [
        c
        for c in [
            "exit_time",
            "symbol",
            "side",
            "entry_price",
            "exit_price",
            "pnl",
            "fees",
            "return_pct",
        ]
        if c in df.columns
    ]
    display_df = df[display_cols].copy()

    # Replace side (always UP for long-only) with result and hold duration
    if "pnl" in display_df.columns:
        display_df["result"] = display_df["pnl"].apply(
            lambda p: "✓ Win" if p > 0 else "✗ Loss"
        )
    if "entry_time" in df.columns and "exit_time" in df.columns:
        display_df["hold"] = ((df["exit_time"] - df["entry_time"]).dt.total_seconds() / 3600).apply(
            lambda h: f"{h:.0f}h" if h < 48 else f"{h/24:.1f}d"
        )
    if "side" in display_df.columns:
        display_df = display_df.drop(columns=["side"])

    column_config: dict[str, Any] = {
        "entry_price": st.column_config.NumberColumn("Entry", format="%.2f"),
        "exit_price": st.column_config.NumberColumn("Exit", format="%.2f"),
        "pnl": st.column_config.NumberColumn("PnL", format="$%.2f"),
        "fees": st.column_config.NumberColumn("Fees", format="$%.4f"),
        "return_pct": st.column_config.NumberColumn("Return %", format="%.2f%%"),
    }
    # Only keep configs for columns that exist
    column_config = {k: v for k, v in column_config.items() if k in display_df.columns}

    st.dataframe(
        display_df,
        column_config=column_config,
        use_container_width=True,
        hide_index=True,
        height=400,
    )


def render_risk_status(db_path: str) -> None:
    """Render the risk status section."""
    st.markdown(
        f'<h3 style="color:{ACCENT_AMBER};margin-top:1.5rem;">🛡 Risk Status</h3>',
        unsafe_allow_html=True,
    )
    risk = load_risk_status(db_path)
    daily_pnl = risk["daily_pnl"]
    exposure = risk["total_exposure"]

    c1, c2, c3 = st.columns(3)

    with c1:
        # Daily drawdown progress — assume $1000 default limit for display
        drawdown_limit = 1000.0
        drawdown_pct = min(abs(daily_pnl) / drawdown_limit, 1.0) if daily_pnl < 0 else 0.0
        bar_color = GREEN if drawdown_pct < 0.5 else (ACCENT_AMBER if drawdown_pct < 0.8 else RED)
        st.markdown(
            f"""
            <div style="margin-bottom:0.5rem;">
                <p style="color:{TEXT_DIM};font-size:0.8rem;margin:0;">Daily Drawdown</p>
                <p style="color:{TEXT_PRIMARY};font-size:1.2rem;margin:0.2rem 0;">
                    ${abs(daily_pnl):,.2f} / ${drawdown_limit:,.2f}
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.progress(drawdown_pct)
        st.markdown(
            f'<div style="height:3px;background:{bar_color};border-radius:2px;margin-top:-12px;"></div>',
            unsafe_allow_html=True,
        )

    with c2:
        # Circuit breaker status
        breaker_active = drawdown_pct >= 1.0
        breaker_color = RED if breaker_active else GREEN
        breaker_label = "TRIPPED" if breaker_active else "NORMAL"
        st.markdown(
            f"""
            <div style="text-align:center;padding:1rem;border:1px solid {breaker_color}40;
                        border-radius:8px;background:{breaker_color}08;">
                <p style="color:{TEXT_DIM};font-size:0.8rem;margin:0;">Circuit Breaker</p>
                <p style="color:{breaker_color};font-size:1.4rem;font-weight:700;margin:0.3rem 0;
                          text-shadow:0 0 12px {breaker_color}60;font-family:monospace;">
                    {breaker_label}
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with c3:
        # Position exposure gauge
        max_exposure = 100_000.0
        exposure_pct = min(exposure / max_exposure, 1.0) if max_exposure else 0.0
        gauge_color = GREEN if exposure_pct < 0.5 else (ACCENT_AMBER if exposure_pct < 0.8 else RED)
        st.markdown(
            f"""
            <div style="margin-bottom:0.5rem;">
                <p style="color:{TEXT_DIM};font-size:0.8rem;margin:0;">Position Exposure</p>
                <p style="color:{TEXT_PRIMARY};font-size:1.2rem;margin:0.2rem 0;">
                    ${exposure:,.2f}
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.progress(exposure_pct)
        st.markdown(
            f'<div style="height:3px;background:{gauge_color};border-radius:2px;margin-top:-12px;"></div>',
            unsafe_allow_html=True,
        )


# ---------------------------------------------------------------------------
# Global CSS injection
# ---------------------------------------------------------------------------
def inject_css() -> None:
    """Inject custom CSS for dark trading dashboard aesthetic."""
    st.markdown(
        f"""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;600;700&display=swap');

            /* Global overrides */
            .stApp {{
                font-family: 'Outfit', sans-serif;
            }}
            [data-testid="stMetricValue"] {{
                font-family: 'JetBrains Mono', monospace;
                font-size: 1.6rem;
            }}
            [data-testid="stMetricDelta"] {{
                font-family: 'JetBrains Mono', monospace;
            }}
            [data-testid="stMetricLabel"] {{
                color: {TEXT_DIM};
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }}

            /* Sidebar styling */
            [data-testid="stSidebar"] {{
                border-right: 1px solid #263238;
            }}

            /* Dataframe styling */
            [data-testid="stDataFrame"] {{
                border: 1px solid #263238;
                border-radius: 8px;
            }}

            /* Progress bar override */
            .stProgress > div > div {{
                border-radius: 4px;
            }}

            /* Divider */
            hr {{
                border-color: #263238 !important;
            }}
        </style>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    """Entry point for the Streamlit dashboard."""
    st.set_page_config(
        page_title="DC Trading",
        page_icon="📈",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    inject_css()

    # Sidebar
    db_path, auto_refresh, interval = render_sidebar()

    # Check DB existence
    db = DashboardData(db_path)
    db_exists = db.db_exists

    # Header
    render_header(db_exists)

    if not db_exists:
        st.warning(
            f"Database not found at `{db_path}`. "
            "Start the trading engine to generate data, or update the path in the sidebar."
        )
        return

    # Load data
    daily = load_daily_pnl(db_path)
    positions = load_positions(db_path)

    # Strategy Comparison (top)
    render_strategy_comparison(db_path)

    # Strategy selector
    strategies = db.get_strategies()
    if not strategies:
        st.info("No strategy data yet.")
        return

    selected = st.selectbox("Select Strategy", strategies, index=0, key="strategy_select")

    # KPI row from selected strategy
    strat_stats = db.get_strategy_stats(selected)
    render_kpi_row(daily, strat_stats, positions)

    st.markdown("<div style='height:1rem;'></div>", unsafe_allow_html=True)

    # Price chart with selected strategy's trades
    price_df = load_price_data()
    trades_chart_df = db.get_strategy_trades_for_chart(selected)
    fig_price = build_price_chart_with_trades(price_df, trades_chart_df)
    fig_price.update_layout(title=f"BTC/USDT 2025 — {selected}")
    st.plotly_chart(fig_price, use_container_width=True, key="price_trades")

    # Charts for selected strategy
    left, right = st.columns(2)
    with left:
        # Cumulative PnL from strategy trades
        strat_trades = db.get_strategy_trades(selected, limit=500)
        if not strat_trades.empty and "pnl" in strat_trades.columns:
            cum_df = strat_trades.sort_values("exit_time")[["exit_time", "pnl"]].copy()
            cum_df["cumulative_pnl"] = cum_df["pnl"].cumsum()
            cum_df["date"] = pd.to_datetime(cum_df["exit_time"], unit="s", utc=True, errors="coerce")
            fig_cum = build_cumulative_pnl_chart(cum_df)
        else:
            fig_cum = build_cumulative_pnl_chart(pd.DataFrame())
        st.plotly_chart(fig_cum, use_container_width=True, key="chart_cum_pnl")
    with right:
        fig_wl = build_win_loss_chart(strat_stats)
        st.plotly_chart(fig_wl, use_container_width=True, key="chart_win_loss")

    # Win/Loss Analysis for selected strategy
    analysis = db.get_strategy_win_loss(selected)
    if analysis["pnl_buckets"] or analysis["monthly"]:
        st.markdown(
            f'<h3 style="color:{ACCENT_CYAN};margin-top:1.5rem;">🎯 Win/Loss Analysis — {selected}</h3>',
            unsafe_allow_html=True,
        )
        c1, c2, c3, c4, c5, c6 = st.columns(6)
        with c1:
            st.metric("Avg Win", f"${analysis['avg_win']:+,.2f}")
        with c2:
            st.metric("Avg Loss", f"${analysis['avg_loss']:+,.2f}")
        with c3:
            st.metric("Payoff Ratio", f"{analysis['payoff_ratio']:.2f}x")
        with c4:
            st.metric("Largest Win", f"${analysis['largest_win']:+,.2f}")
        with c5:
            st.metric("Largest Loss", f"${analysis['largest_loss']:+,.2f}")
        with c6:
            st.metric("Avg Hold (W/L)", f"{analysis['avg_hold_win_h']:.0f}h / {analysis['avg_hold_loss_h']:.0f}h")
        left2, right2 = st.columns(2)
        with left2:
            st.plotly_chart(build_pnl_distribution_chart(analysis["pnl_buckets"]), use_container_width=True, key="pnl_dist")
        with right2:
            st.plotly_chart(build_monthly_pnl_chart(analysis["monthly"]), use_container_width=True, key="monthly_pnl")

    # Trade History for selected strategy
    st.markdown(
        f'<h3 style="color:{ACCENT_CYAN};margin-top:1.5rem;">📊 Trade History — {selected}</h3>',
        unsafe_allow_html=True,
    )
    strat_df = db.get_strategy_trades(selected)
    if not strat_df.empty:
        display_cols = [c for c in ["exit_time_dt", "entry_price", "exit_price", "pnl", "fees", "return_pct"] if c in strat_df.columns]
        display_df = strat_df[display_cols].copy()
        if "pnl" in display_df.columns:
            display_df["result"] = display_df["pnl"].apply(lambda p: "✓ Win" if p > 0 else "✗ Loss")
        if "entry_time_dt" in strat_df.columns and "exit_time_dt" in strat_df.columns:
            display_df["hold"] = ((strat_df["exit_time_dt"] - strat_df["entry_time_dt"]).dt.total_seconds() / 3600).apply(
                lambda h: f"{h:.0f}h" if h < 48 else f"{h/24:.1f}d"
            )
        col_cfg = {
            "entry_price": st.column_config.NumberColumn("Entry", format="%.2f"),
            "exit_price": st.column_config.NumberColumn("Exit", format="%.2f"),
            "pnl": st.column_config.NumberColumn("PnL", format="$%.2f"),
            "fees": st.column_config.NumberColumn("Fees", format="$%.4f"),
            "return_pct": st.column_config.NumberColumn("Return %", format="%.2f%%"),
        }
        col_cfg = {k: v for k, v in col_cfg.items() if k in display_df.columns}
        st.dataframe(display_df, column_config=col_cfg, use_container_width=True, hide_index=True, height=400)
    else:
        st.info("No trades for this strategy.")
    # Auto-refresh
    if auto_refresh:
        st.markdown(
            f"""
            <p style="text-align:center;color:{TEXT_DIM};font-size:0.75rem;
                      margin-top:2rem;font-family:monospace;">
                Auto-refreshing every {interval}s
            </p>
            """,
            unsafe_allow_html=True,
        )
        import time

        time.sleep(interval)
        st.rerun()


if __name__ == "__main__":
    main()
