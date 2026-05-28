#!/usr/bin/env python3
"""
Ekiti Community Housing Initiative - Terminal Dashboard
A beautiful terminal-based dashboard for tracking project progress
"""

import os
import sys
import time
from datetime import datetime

# Try to import rich for beautiful terminal UI
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.progress import Progress, BarColumn, TextColumn, TaskProgressColumn
    from rich.live import Live
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("Installing rich library for beautiful dashboard...")
    os.system("pip install rich --break-system-packages")
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.progress import Progress, BarColumn, TextColumn, TaskProgressColumn
    from rich.live import Live
    from rich import box

console = Console()

# ============================================================================
# PROJECT DATA (You can update these values)
# ============================================================================

PROJECT_DATA = {
    "name": "Ekiti Community Housing Initiative",
    "location": "Ado-Ekiti, Ekiti State, Nigeria",
    "units": 10,
    "unit_size": "40 sqm",
    "target_budget": 25000000,  # ₦25M
    "funds_raised": 3500000,    # ₦3.5M (update this as you raise money)
    "start_date": "2025-02-01",
    "target_completion": "2025-12-01",
}

MILESTONES = [
    {
        "name": "Land & Preparation",
        "budget": 3500000,
        "percentage": 14,
        "status": "Planning",  # Planning, In Progress, Completed
        "paid": 0
    },
    {
        "name": "Foundation & Structure",
        "budget": 8500000,
        "percentage": 34,
        "status": "Not Started",
        "paid": 0
    },
    {
        "name": "Roofing",
        "budget": 2800000,
        "percentage": 11,
        "status": "Not Started",
        "paid": 0
    },
    {
        "name": "Doors, Windows & Finishes",
        "budget": 4200000,
        "percentage": 17,
        "status": "Not Started",
        "paid": 0
    },
    {
        "name": "Electrical & Plumbing",
        "budget": 2500000,
        "percentage": 10,
        "status": "Not Started",
        "paid": 0
    },
    {
        "name": "Final & Contingency",
        "budget": 3500000,
        "percentage": 14,
        "status": "Not Started",
        "paid": 0
    },
]

CONTRIBUTORS = [
    {"name": "Diaspora (UK)", "amount": 2000000},
    {"name": "Diaspora (USA)", "amount": 1000000},
    {"name": "Community Levy", "amount": 300000},
    {"name": "Individual Donors", "amount": 200000},
]

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def format_naira(amount):
    """Format number as Naira currency"""
    return f"₦{amount:,.0f}"

def calculate_days_remaining():
    """Calculate days until target completion"""
    from datetime import datetime
    target = datetime.strptime(PROJECT_DATA["target_completion"], "%Y-%m-%d")
    today = datetime.now()
    delta = target - today
    return max(0, delta.days)

def calculate_funding_progress():
    """Calculate funding percentage"""
    raised = PROJECT_DATA["funds_raised"]
    target = PROJECT_DATA["target_budget"]
    return (raised / target) * 100 if target > 0 else 0

def get_status_color(status):
    """Get color for status"""
    colors = {
        "Not Started": "dim",
        "Planning": "yellow",
        "In Progress": "cyan",
        "Completed": "green",
    }
    return colors.get(status, "white")

# ============================================================================
# DASHBOARD SECTIONS
# ============================================================================

def create_header():
    """Create dashboard header"""
    header_text = f"""
[bold cyan]{PROJECT_DATA['name']}[/bold cyan]
[dim]{PROJECT_DATA['location']}[/dim]
[yellow]Terminal Dashboard v1.0[/yellow]
    """
    return Panel(
        header_text.strip(),
        title=f"📊 Project Dashboard - {datetime.now().strftime('%B %d, %Y')}",
        border_style="cyan",
        box=box.DOUBLE
    )

def create_overview_table():
    """Create project overview table"""
    table = Table(
        title="Project Overview",
        box=box.ROUNDED,
        border_style="blue",
        show_header=True,
        header_style="bold magenta"
    )
    
    table.add_column("Metric", style="cyan", width=30)
    table.add_column("Value", style="green", width=30)
    
    # Funding progress
    funding_pct = calculate_funding_progress()
    
    table.add_row(
        "Total Housing Units",
        f"{PROJECT_DATA['units']} units × {PROJECT_DATA['unit_size']}"
    )
    table.add_row(
        "Total Budget",
        format_naira(PROJECT_DATA['target_budget'])
    )
    table.add_row(
        "Funds Raised",
        f"{format_naira(PROJECT_DATA['funds_raised'])} ([green]{funding_pct:.1f}%[/green])"
    )
    table.add_row(
        "Remaining to Raise",
        format_naira(PROJECT_DATA['target_budget'] - PROJECT_DATA['funds_raised'])
    )
    table.add_row(
        "Days to Completion",
        f"{calculate_days_remaining()} days"
    )
    table.add_row(
        "Cost per Unit",
        format_naira(PROJECT_DATA['target_budget'] / PROJECT_DATA['units'])
    )
    
    return table

def create_funding_progress():
    """Create funding progress bar"""
    progress = Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=40),
        TaskProgressColumn(),
        TextColumn("{task.fields[amount]}"),
    )
    
    raised = PROJECT_DATA['funds_raised']
    target = PROJECT_DATA['target_budget']
    percentage = (raised / target) * 100
    
    task = progress.add_task(
        "[cyan]Fundraising Progress",
        total=100,
        completed=percentage,
        amount=f"{format_naira(raised)} / {format_naira(target)}"
    )
    
    return Panel(
        progress,
        title="💰 Funding Status",
        border_style="green",
        box=box.ROUNDED
    )

def create_milestones_table():
    """Create construction milestones table"""
    table = Table(
        title="Construction Milestones",
        box=box.ROUNDED,
        border_style="yellow",
        show_header=True,
        header_style="bold yellow"
    )
    
    table.add_column("Milestone", style="cyan", width=25)
    table.add_column("Budget", justify="right", style="green", width=15)
    table.add_column("Status", justify="center", width=15)
    table.add_column("Paid", justify="right", width=15)
    
    for milestone in MILESTONES:
        status_color = get_status_color(milestone['status'])
        paid_pct = (milestone['paid'] / milestone['budget'] * 100) if milestone['budget'] > 0 else 0
        
        table.add_row(
            milestone['name'],
            format_naira(milestone['budget']),
            f"[{status_color}]{milestone['status']}[/{status_color}]",
            f"{format_naira(milestone['paid'])} ({paid_pct:.0f}%)"
        )
    
    return table

def create_contributors_table():
    """Create top contributors table"""
    table = Table(
        title="Recent Contributions",
        box=box.ROUNDED,
        border_style="magenta",
        show_header=True,
        header_style="bold magenta"
    )
    
    table.add_column("Source", style="cyan", width=25)
    table.add_column("Amount", justify="right", style="green", width=20)
    table.add_column("% of Total", justify="right", width=15)
    
    total = PROJECT_DATA['funds_raised']
    
    for contributor in CONTRIBUTORS:
        percentage = (contributor['amount'] / total * 100) if total > 0 else 0
        table.add_row(
            contributor['name'],
            format_naira(contributor['amount']),
            f"{percentage:.1f}%"
        )
    
    return table

def create_quick_stats():
    """Create quick stats panel"""
    funding_pct = calculate_funding_progress()
    remaining = PROJECT_DATA['target_budget'] - PROJECT_DATA['funds_raised']
    days_left = calculate_days_remaining()
    
    # Calculate average daily fundraising needed
    avg_daily_needed = remaining / days_left if days_left > 0 else 0
    
    stats = f"""
[cyan]📈 Funding Progress:[/cyan] [green]{funding_pct:.1f}%[/green]
[cyan]💵 Amount Raised:[/cyan] {format_naira(PROJECT_DATA['funds_raised'])}
[cyan]🎯 Target:[/cyan] {format_naira(PROJECT_DATA['target_budget'])}
[cyan]📉 Remaining:[/cyan] {format_naira(remaining)}
[cyan]⏰ Days Left:[/cyan] {days_left} days
[cyan]📊 Daily Need:[/cyan] {format_naira(avg_daily_needed)}/day
[cyan]👥 Contributors:[/cyan] {len(CONTRIBUTORS)} sources
[cyan]🏠 Units:[/cyan] {PROJECT_DATA['units']} houses
    """
    
    return Panel(
        stats.strip(),
        title="⚡ Quick Stats",
        border_style="cyan",
        box=box.ROUNDED
    )

def create_next_steps():
    """Create next steps panel"""
    next_steps = """
[yellow]1.[/yellow] [cyan]Complete diaspora fundraising campaign[/cyan]
   Target: ₦10M from UK/USA associations

[yellow]2.[/yellow] [cyan]Submit government grant applications[/cyan]
   Target: ₦5M from Ekiti State programs

[yellow]3.[/yellow] [cyan]Finalize land acquisition[/cyan]
   Budget: ₦2M allocated

[yellow]4.[/yellow] [cyan]Begin architect detailed designs[/cyan]
   Timeline: 4-6 weeks

[yellow]5.[/yellow] [cyan]Launch community levy campaign[/cyan]
   Target: ₦5M from local contributions
    """
    
    return Panel(
        next_steps.strip(),
        title="📋 Next Steps",
        border_style="yellow",
        box=box.ROUNDED
    )

def create_alerts():
    """Create important alerts/notifications"""
    funding_pct = calculate_funding_progress()
    days_left = calculate_days_remaining()
    
    alerts = []
    
    if funding_pct < 20:
        alerts.append("[red]⚠️  URGENT: Fundraising below 20% - Intensify diaspora outreach[/red]")
    elif funding_pct < 50:
        alerts.append("[yellow]⚠️  Fundraising at {:.1f}% - Continue strong momentum[/yellow]".format(funding_pct))
    else:
        alerts.append("[green]✅ Excellent progress! {:.1f}% funded[/green]".format(funding_pct))
    
    if days_left < 100:
        alerts.append(f"[yellow]⏰ Less than 100 days to target completion![/yellow]")
    
    if PROJECT_DATA['funds_raised'] >= MILESTONES[0]['budget']:
        alerts.append("[green]✅ Ready to start Milestone 1: Land & Preparation[/green]")
    
    alert_text = "\n".join(alerts) if alerts else "[green]No alerts - All systems normal[/green]"
    
    return Panel(
        alert_text,
        title="🔔 Alerts & Notifications",
        border_style="red",
        box=box.ROUNDED
    )

# ============================================================================
# MAIN DASHBOARD
# ============================================================================

def create_full_dashboard():
    """Create complete dashboard layout"""
    layout = Layout()
    
    # Create sections
    layout.split_column(
        Layout(name="header", size=5),
        Layout(name="main", ratio=1),
        Layout(name="footer", size=3)
    )
    
    # Split main into left and right
    layout["main"].split_row(
        Layout(name="left", ratio=2),
        Layout(name="right", ratio=1)
    )
    
    # Split left into sections
    layout["left"].split_column(
        Layout(name="overview"),
        Layout(name="funding"),
        Layout(name="milestones")
    )
    
    # Split right into sections
    layout["right"].split_column(
        Layout(name="stats"),
        Layout(name="contributors"),
        Layout(name="next_steps")
    )
    
    # Populate sections
    layout["header"].update(create_header())
    layout["overview"].update(create_overview_table())
    layout["funding"].update(create_funding_progress())
    layout["milestones"].update(create_milestones_table())
    layout["stats"].update(create_quick_stats())
    layout["contributors"].update(create_contributors_table())
    layout["next_steps"].update(create_next_steps())
    layout["footer"].update(create_alerts())
    
    return layout

def display_simple_dashboard():
    """Display simple dashboard without rich library"""
    print("\n" + "="*60)
    print("EKITI COMMUNITY HOUSING INITIATIVE - DASHBOARD")
    print("="*60 + "\n")
    
    print(f"Project: {PROJECT_DATA['name']}")
    print(f"Location: {PROJECT_DATA['location']}")
    print(f"Units: {PROJECT_DATA['units']} × {PROJECT_DATA['unit_size']}")
    print(f"\nTotal Budget: {format_naira(PROJECT_DATA['target_budget'])}")
    print(f"Raised: {format_naira(PROJECT_DATA['funds_raised'])} ({calculate_funding_progress():.1f}%)")
    print(f"Remaining: {format_naira(PROJECT_DATA['target_budget'] - PROJECT_DATA['funds_raised'])}")
    print(f"Days to Completion: {calculate_days_remaining()}")
    
    print("\n" + "-"*60)
    print("MILESTONES:")
    print("-"*60)
    for i, milestone in enumerate(MILESTONES, 1):
        print(f"{i}. {milestone['name']}")
        print(f"   Budget: {format_naira(milestone['budget'])} | Status: {milestone['status']}")
    
    print("\n" + "-"*60)
    print("CONTRIBUTORS:")
    print("-"*60)
    for contributor in CONTRIBUTORS:
        print(f"- {contributor['name']}: {format_naira(contributor['amount'])}")
    
    print("\n" + "="*60 + "\n")

# ============================================================================
# INTERACTIVE MENU
# ============================================================================

def show_menu():
    """Show interactive menu"""
    console.clear()
    
    menu = """
[bold cyan]Ekiti Housing Dashboard - Main Menu[/bold cyan]

[yellow]1.[/yellow] [cyan]View Dashboard[/cyan]
[yellow]2.[/yellow] [cyan]Update Fundraising Amount[/cyan]
[yellow]3.[/yellow] [cyan]Add New Contribution[/cyan]
[yellow]4.[/yellow] [cyan]Update Milestone Status[/cyan]
[yellow]5.[/yellow] [cyan]View Detailed Statistics[/cyan]
[yellow]6.[/yellow] [cyan]Export Data[/cyan]
[yellow]7.[/yellow] [cyan]Settings[/cyan]
[yellow]8.[/yellow] [cyan]Help[/cyan]
[yellow]0.[/yellow] [red]Exit[/red]

[dim]Enter your choice:[/dim]
    """
    
    console.print(Panel(menu.strip(), border_style="cyan", box=box.ROUNDED))
    return input("> ").strip()

def update_fundraising():
    """Update total funds raised"""
    console.print("\n[cyan]Current funds raised:[/cyan]", format_naira(PROJECT_DATA['funds_raised']))
    try:
        new_amount = float(input("Enter new total amount raised (in Naira): ").strip().replace(",", ""))
        PROJECT_DATA['funds_raised'] = new_amount
        console.print(f"[green]✅ Updated! New total:[/green] {format_naira(new_amount)}")
    except ValueError:
        console.print("[red]❌ Invalid amount[/red]")
    input("\nPress Enter to continue...")

def add_contribution():
    """Add new contribution"""
    console.print("\n[cyan]Add New Contribution[/cyan]\n")
    name = input("Contributor name/source: ").strip()
    try:
        amount = float(input("Amount (in Naira): ").strip().replace(",", ""))
        CONTRIBUTORS.append({"name": name, "amount": amount})
        PROJECT_DATA['funds_raised'] += amount
        console.print(f"[green]✅ Added {name}: {format_naira(amount)}[/green]")
        console.print(f"[green]New total: {format_naira(PROJECT_DATA['funds_raised'])}[/green]")
    except ValueError:
        console.print("[red]❌ Invalid amount[/red]")
    input("\nPress Enter to continue...")

def update_milestone():
    """Update milestone status"""
    console.print("\n[cyan]Update Milestone Status[/cyan]\n")
    
    for i, milestone in enumerate(MILESTONES, 1):
        console.print(f"{i}. {milestone['name']} - [yellow]{milestone['status']}[/yellow]")
    
    try:
        choice = int(input("\nSelect milestone number: ").strip()) - 1
        if 0 <= choice < len(MILESTONES):
            console.print("\nStatus options:")
            console.print("1. Not Started")
            console.print("2. Planning")
            console.print("3. In Progress")
            console.print("4. Completed")
            
            status_choice = int(input("\nSelect new status: ").strip())
            statuses = ["Not Started", "Planning", "In Progress", "Completed"]
            if 1 <= status_choice <= 4:
                MILESTONES[choice]['status'] = statuses[status_choice - 1]
                console.print(f"[green]✅ Updated {MILESTONES[choice]['name']} to {statuses[status_choice - 1]}[/green]")
        else:
            console.print("[red]❌ Invalid milestone number[/red]")
    except (ValueError, IndexError):
        console.print("[red]❌ Invalid input[/red]")
    
    input("\nPress Enter to continue...")

def show_statistics():
    """Show detailed statistics"""
    console.clear()
    
    stats_table = Table(title="Detailed Statistics", box=box.DOUBLE, border_style="cyan")
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Value", style="green")
    
    funding_pct = calculate_funding_progress()
    remaining = PROJECT_DATA['target_budget'] - PROJECT_DATA['funds_raised']
    days_left = calculate_days_remaining()
    avg_daily = remaining / days_left if days_left > 0 else 0
    
    total_contributors = len(CONTRIBUTORS)
    avg_contribution = PROJECT_DATA['funds_raised'] / total_contributors if total_contributors > 0 else 0
    
    completed_milestones = sum(1 for m in MILESTONES if m['status'] == 'Completed')
    in_progress_milestones = sum(1 for m in MILESTONES if m['status'] == 'In Progress')
    
    stats_table.add_row("Funding Progress", f"{funding_pct:.2f}%")
    stats_table.add_row("Amount Raised", format_naira(PROJECT_DATA['funds_raised']))
    stats_table.add_row("Amount Remaining", format_naira(remaining))
    stats_table.add_row("Days Remaining", str(days_left))
    stats_table.add_row("Average Daily Need", format_naira(avg_daily))
    stats_table.add_row("Total Contributors", str(total_contributors))
    stats_table.add_row("Average Contribution", format_naira(avg_contribution))
    stats_table.add_row("Completed Milestones", f"{completed_milestones}/{len(MILESTONES)}")
    stats_table.add_row("In Progress Milestones", str(in_progress_milestones))
    stats_table.add_row("Cost per Unit", format_naira(PROJECT_DATA['target_budget'] / PROJECT_DATA['units']))
    stats_table.add_row("Cost per SQM", format_naira(PROJECT_DATA['target_budget'] / (PROJECT_DATA['units'] * 40)))
    
    console.print(stats_table)
    input("\nPress Enter to continue...")

def export_data():
    """Export data to file"""
    console.print("\n[cyan]Exporting data...[/cyan]")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ekiti_housing_data_{timestamp}.txt"
    
    with open(filename, 'w') as f:
        f.write("EKITI COMMUNITY HOUSING INITIATIVE - DATA EXPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("PROJECT OVERVIEW:\n")
        f.write(f"Name: {PROJECT_DATA['name']}\n")
        f.write(f"Location: {PROJECT_DATA['location']}\n")
        f.write(f"Units: {PROJECT_DATA['units']} × {PROJECT_DATA['unit_size']}\n")
        f.write(f"Total Budget: {format_naira(PROJECT_DATA['target_budget'])}\n")
        f.write(f"Funds Raised: {format_naira(PROJECT_DATA['funds_raised'])}\n")
        f.write(f"Funding Progress: {calculate_funding_progress():.2f}%\n\n")
        
        f.write("MILESTONES:\n")
        for i, milestone in enumerate(MILESTONES, 1):
            f.write(f"{i}. {milestone['name']}\n")
            f.write(f"   Budget: {format_naira(milestone['budget'])}\n")
            f.write(f"   Status: {milestone['status']}\n")
            f.write(f"   Paid: {format_naira(milestone['paid'])}\n\n")
        
        f.write("CONTRIBUTORS:\n")
        for contributor in CONTRIBUTORS:
            f.write(f"- {contributor['name']}: {format_naira(contributor['amount'])}\n")
    
    console.print(f"[green]✅ Data exported to {filename}[/green]")
    input("\nPress Enter to continue...")

def show_help():
    """Show help information"""
    console.clear()
    
    help_text = """
[bold cyan]Ekiti Housing Dashboard - Help[/bold cyan]

[yellow]Dashboard Features:[/yellow]
• Real-time tracking of fundraising progress
• Construction milestone management
• Contributor tracking
• Budget monitoring
• Timeline tracking

[yellow]How to Use:[/yellow]
1. View Dashboard - See all project metrics at a glance
2. Update Fundraising - Modify total funds raised
3. Add Contribution - Record new donations
4. Update Milestone - Change construction phase status
5. View Statistics - Detailed project analytics
6. Export Data - Save current data to file

[yellow]Keyboard Shortcuts:[/yellow]
• Ctrl+C - Exit at any time
• Enter - Continue/Confirm

[yellow]Data Persistence:[/yellow]
Data is stored in this script. To make changes permanent:
1. Edit PROJECT_DATA, MILESTONES, or CONTRIBUTORS
2. Save the file
3. Restart the dashboard

[yellow]Support:[/yellow]
For issues or questions, contact the project administrator.

[yellow]Version:[/yellow] 1.0 - Terminal Dashboard
    """
    
    console.print(Panel(help_text.strip(), border_style="cyan", box=box.ROUNDED))
    input("\nPress Enter to continue...")

# ============================================================================
# MAIN APPLICATION
# ============================================================================

def main():
    """Main application loop"""
    try:
        while True:
            choice = show_menu()
            
            if choice == "1":
                console.clear()
                console.print(create_full_dashboard())
                input("\n\nPress Enter to return to menu...")
            elif choice == "2":
                update_fundraising()
            elif choice == "3":
                add_contribution()
            elif choice == "4":
                update_milestone()
            elif choice == "5":
                show_statistics()
            elif choice == "6":
                export_data()
            elif choice == "7":
                console.print("\n[yellow]Settings coming soon...[/yellow]")
                input("\nPress Enter to continue...")
            elif choice == "8":
                show_help()
            elif choice == "0":
                console.print("\n[cyan]Thank you for using Ekiti Housing Dashboard![/cyan]")
                console.print("[yellow]Building Ekiti's Future Together 🏠🇳🇬[/yellow]\n")
                break
            else:
                console.print("\n[red]Invalid choice. Please try again.[/red]")
                time.sleep(1)
    
    except KeyboardInterrupt:
        console.print("\n\n[yellow]Dashboard closed.[/yellow]")
        console.print("[cyan]Ẹ ṣé púpọ̀! (Thank you!)[/cyan]\n")

if __name__ == "__main__":
    # Clear screen on start
    os.system('clear' if os.name != 'nt' else 'cls')
    
    # Show welcome message
    console.print(Panel(
        "[bold cyan]Welcome to Ekiti Community Housing Initiative Dashboard[/bold cyan]\n"
        "[yellow]Track your affordable housing project in real-time[/yellow]",
        border_style="green",
        box=box.DOUBLE
    ))
    time.sleep(2)
    
    # Run main application
    main()
