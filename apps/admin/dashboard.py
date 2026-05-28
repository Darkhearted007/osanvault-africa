#!/usr/bin/env python3
"""
ÒsánVault Africa - Live Terminal Dashboard
Founder Operations Command Center
Auto-refreshes every 30 seconds from live API
"""

import os
import sys
import time
import requests
from datetime import datetime

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.progress import Progress, BarColumn, TextColumn, TaskProgressColumn
    from rich.live import Live
    from rich.columns import Columns
    from rich import box
except ImportError:
    os.system("pip install rich --break-system-packages")
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.progress import Progress, BarColumn, TextColumn, TaskProgressColumn
    from rich.live import Live
    from rich.columns import Columns
    from rich import box

console = Console()

API_BASE = "http://localhost:3001"
REFRESH_INTERVAL = 30  # seconds

# ── Helpers ──────────────────────────────────────────────────────────────────

def api_get(path):
    try:
        r = requests.get(f"{API_BASE}{path}", timeout=5)
        return r.json()
    except Exception as e:
        return None

def fmt_usd(val):
    try:
        return f"${float(val):,.2f}"
    except:
        return "$0.00"

def fmt_num(val):
    try:
        return f"{int(val):,}"
    except:
        return "0"

def status_color(status):
    return {
        "not_started": "dim",
        "planning": "yellow",
        "in_progress": "cyan",
        "completed": "green",
        "verified": "bold green",
        "active": "green",
        "pending": "yellow",
        "fully_funded": "bold green",
        "closed": "dim",
    }.get(status, "white")

# ── Panels ───────────────────────────────────────────────────────────────────

def make_header():
    now = datetime.now().strftime("%A, %d %B %Y  %H:%M:%S WAT")
    return Panel(
        f"[bold gold1]ÒsánVault Africa[/bold gold1]  [dim]|[/dim]  "
        f"[cyan]Founder Operations Dashboard[/cyan]  [dim]|[/dim]  "
        f"[dim]{now}[/dim]\n"
        f"[dim]OSANV Token · 500,000,000 SPL · Solana · KBW 2026 Seoul[/dim]",
        border_style="gold1",
        box=box.DOUBLE,
    )

def make_summary(summary):
    if not summary:
        return Panel("[red]API Unavailable[/red]", title="Platform Summary", border_style="red")

    d = summary.get("data", {})
    cached = "⚡ cached" if summary.get("cached") else "🔴 live"

    table = Table(box=None, show_header=False, padding=(0, 2))
    table.add_column("Metric", style="dim", width=28)
    table.add_column("Value", style="bold white")

    table.add_row("Total Value Locked (TVL)", f"[gold1]{fmt_usd(d.get('total_tvl', 0))}[/gold1]")
    table.add_row("Active Properties", f"[green]{d.get('active_properties', 0)}[/green] / {d.get('total_properties', 0)} total")
    table.add_row("Total Investors", fmt_num(d.get('total_investors', 0)))
    table.add_row("Total Invested", fmt_usd(d.get('total_invested', 0)))
    table.add_row("Dividends Distributed", fmt_usd(d.get('total_dividends_paid', 0)))
    table.add_row("Completed Milestones", fmt_num(d.get('completed_milestones', 0)))
    table.add_row("Active Milestones", fmt_num(d.get('active_milestones', 0)))

    return Panel(table, title=f"📊 Platform Summary [{cached}]", border_style="gold1", box=box.ROUNDED)

def make_properties(overview):
    if not overview:
        return Panel("[red]No data[/red]", title="Properties", border_style="red")

    table = Table(
        box=box.SIMPLE,
        border_style="blue",
        show_header=True,
        header_style="bold cyan",
        expand=True,
    )
    table.add_column("Property", style="white", width=28)
    table.add_column("Country", width=10)
    table.add_column("Value", justify="right", width=14)
    table.add_column("Yield", justify="right", width=8)
    table.add_column("Construction", justify="right", width=14)
    table.add_column("Status", justify="center", width=12)
    table.add_column("Milestones", justify="center", width=12)

    for p in overview.get("data", []):
        progress = float(p.get("construction_progress", 0))
        color = status_color(p.get("status", ""))
        completed = p.get("completed_milestones", 0)
        total = p.get("total_milestones", 0)

        bar = "█" * int(progress / 10) + "░" * (10 - int(progress / 10))

        table.add_row(
            p.get("title", "")[:26],
            p.get("country", ""),
            fmt_usd(p.get("total_value", 0)),
            f"[green]{p.get('annual_yield', 0)}%[/green]",
            f"[cyan]{bar}[/cyan] {progress:.0f}%",
            f"[{color}]{p.get('status', '')}[/{color}]",
            f"{completed}/{total}",
        )

    return Panel(table, title="🏢 Tokenized Properties", border_style="blue", box=box.ROUNDED)

def make_health(health):
    if not health:
        return Panel("[red]❌ API Offline[/red]", title="System Health", border_style="red")

    services = health.get("services", {})

    def svc(name, key):
        ok = services.get(key) == "ok"
        icon = "✅" if ok else "❌"
        color = "green" if ok else "red"
        return f"{icon} [bold {color}]{name}[/bold {color}]"

    text = (
        f"{svc('API', 'api')}    "
        f"{svc('PostgreSQL', 'database')}    "
        f"{svc('Redis', 'redis')}\n"
        f"[dim]Version: {health.get('version', '?')} · "
        f"{health.get('timestamp', '')[:19]}[/dim]"
    )

    return Panel(text, title="⚙️  System Health", border_style="green", box=box.ROUNDED)

def make_osanv():
    text = (
        "[gold1]OSANV[/gold1] · Solana SPL Token\n"
        "[dim]Supply:[/dim] [white]500,000,000[/white]\n\n"
        "[dim]Tranches:[/dim]\n"
        " 1 Public Sale\n"
        " 2 Ecosystem & Rewards\n"
        " 3 Team & Advisors\n"
        " 4 Treasury & Reserve\n"
        " 5 Strategic Partners\n"
        " 6 Liquidity\n\n"
        "[dim]⚠ NET is deprecated[/dim]"
    )
    return Panel(text, title="🪙 OSANV Token", border_style="gold1", box=box.ROUNDED)

def make_footer(refresh_in):
    return Panel(
        f"[dim]Next refresh in [cyan]{refresh_in}s[/cyan] · "
        f"Press [yellow]Ctrl+C[/yellow] to exit · "
        f"API: [cyan]{API_BASE}[/cyan] · "
        f"KBW 2026 Seoul: Sep 29 – Oct 1[/dim]",
        border_style="dim",
        box=box.SIMPLE,
    )

# ── Main Loop ─────────────────────────────────────────────────────────────────

def render(refresh_in=30):
    summary  = api_get("/api/dashboard/summary")
    overview = api_get("/api/dashboard/properties-overview")
    health   = api_get("/health")

    layout = Layout()
    layout.split_column(
        Layout(name="header", size=4),
        Layout(name="health", size=5),
        Layout(name="middle", size=12),
        Layout(name="properties", size=14),
        Layout(name="footer", size=3),
    )

    layout["middle"].split_row(
        Layout(name="summary", ratio=2),
        Layout(name="osanv", ratio=1),
    )

    layout["header"].update(make_header())
    layout["health"].update(make_health(health))
    layout["summary"].update(make_summary(summary))
    layout["osanv"].update(make_osanv())
    layout["properties"].update(make_properties(overview))
    layout["footer"].update(make_footer(refresh_in))

    return layout

def main():
    console.clear()
    console.print("[gold1]ÒsánVault Africa Terminal Dashboard[/gold1] — Starting...")

    try:
        with Live(render(), refresh_per_second=1, screen=True) as live:
            elapsed = 0
            while True:
                time.sleep(1)
                elapsed += 1
                refresh_in = REFRESH_INTERVAL - (elapsed % REFRESH_INTERVAL)
                if elapsed % REFRESH_INTERVAL == 0:
                    live.update(render(refresh_in))
                else:
                    live.update(render(refresh_in))
    except KeyboardInterrupt:
        console.clear()
        console.print("\n[gold1]ÒsánVault Africa[/gold1] — Dashboard closed. Àṣẹ. 🌍\n")

if __name__ == "__main__":
    main()
