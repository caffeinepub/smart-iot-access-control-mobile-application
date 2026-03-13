# Smart IoT Access Control – Version 16

## Current State

The app is a full-stack IoT access control dashboard with:
- Dashboard: lock/unlock, battery, WiFi, telemetry, firmware update panel
- Event Monitoring: access logs with timestamps
- User Management: add/remove users with RFID
- Reports: bar/donut/radar charts for task outcomes, access analytics
- Settings: theme switcher, 2FA, webhook, emergency contacts
- To-Do List: tasks with timers, CR credit system, gamification (ROOKIE to ELITE), animated backgrounds per theme
- Admin Dashboard (credential-gated): monitoring
- AI Assistant: basic chat panel
- Notifications bell, onboarding walkthrough, geo-fencing hook
- Dynamic live backgrounds per theme (6 themes)

The parts are mostly isolated — they share theme context but don't share data or state cross-page.

## Requested Changes (Diff)

### Add
- **Cross-page data sharing**: shared app-level store (Zustand or React context) that connects IoT device state, access events, todo stats, and credits across all pages
- **Improved Dashboard**: summary cards showing todo completion rate, total CR earned, recent access events count, and device uptime side by side with existing lock/WiFi/battery cards; quick-links to each section; live activity feed combining access logs + task completions
- **Pomodoro Timer**: in To-Do list, a focused 25-min session timer with 2x CR multiplier when completing tasks during active session
- **Daily Challenges**: auto-generated daily missions (e.g. "Complete 3 tasks today") with bonus CR rewards; shown in To-Do and on Dashboard
- **Task Combo Bonus**: completing multiple tasks consecutively awards combo multiplier (2x, 3x) with visual flash
- **CR Spending Store**: modal in To-Do list to spend CR on unlocking bonus themes or profile badges
- **Leaderboard panel**: in Admin Dashboard, shows top users by CR earned (mock data for demo)
- **Animated IoT Data Flow Visualization**: in Architecture page, animated SVG/canvas pipeline showing ESP32 → MQTT → Cloud → Dashboard data flow
- **Access Log Heatmap**: in Reports, heatmap grid by day-of-week × hour showing access frequency
- **User-level access frequency breakdown**: in Reports, bar chart per user
- **Line chart for task success rate trend**: in Reports, daily success % over last 14 days
- **Export CSV buttons**: in Reports and Event Monitoring pages
- **Sound effects**: subtle click/unlock/credit-reward sounds (user-togglable in Settings)
- **AI Assistant improvements**: smart suggestions based on overdue tasks, weekly summary, natural language task creation prompt
- **Recurring access windows**: in User Management, each user can have weekly recurring time windows
- **Webhook forwarding panel**: already exists in Settings, wire it to show simulated outgoing alert log
- **Emergency contact simulation**: already exists, wire it to trigger from failed access events on Dashboard

### Modify
- Dashboard layout: upgrade to 6-column grid with summary stats row at top, activity feed sidebar
- MainLayout navigation: ensure all pages are linked in sidebar with icons
- Reports page: add new charts and CSV export
- Admin Dashboard: add leaderboard, system overview connecting real data
- To-Do List: integrate Pomodoro, daily challenges, combo bonus, CR store
- AI Assistant: smarter context-aware suggestions using todo and access event counts
- Architecture page: replace static diagram with animated data flow

### Remove
- Nothing to remove

## Implementation Plan

1. Create `AppStateContext` — shared React context providing: todoStats (completed, overdue, streak, totalCR), recentAccessEvents (last 5), deviceStatus snapshot, daily challenge state
2. Upgrade Dashboard page — new top stats row, live activity feed, daily challenge widget, quick-action buttons
3. Upgrade To-Do List — Pomodoro timer component, daily challenge panel, combo bonus tracker, CR store modal
4. Upgrade Reports page — access heatmap, user frequency chart, task success rate line chart, CSV export
5. Upgrade Admin Dashboard — leaderboard table, connected system stats
6. Upgrade Architecture page — animated SVG data flow pipeline
7. Add sound effects utility + toggle in Settings
8. Wire AI assistant with context-aware suggestions
9. Wire webhook panel to show simulated log on failed access
10. Wire emergency contact alert on intrusion detection
