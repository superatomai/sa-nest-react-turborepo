#!/usr/bin/env python3
"""
Demo Data Analysis Module
Shows different persona views and actions for the planning system demo
"""

import duckdb
import pandas as pd
import json
from datetime import datetime, date, timedelta
from typing import Dict, List, Any
import os

class PlanningAnalyzer:
    def __init__(self, db_path='generated/planning_demo.duckdb'):
        self.conn = duckdb.connect(db_path)
        self.db_path = db_path

        # Check if file exists
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Database file not found: {db_path}")

        print(f"📊 Connected to database: {db_path}")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()

    def executive_dashboard(self, user_name="Sarah Chen (CEO)"):
        """
        Scene 1: Executive Command Center
        Query: "Show me our Q1 status and let me fix what's broken"
        """
        print(f"\n🎯 === EXECUTIVE DASHBOARD for {user_name} ===")
        print("VIEW: Executive Command Center")
        print("QUERY: 'Show me our Q1 status and let me fix what's broken'")

        # High-level KPIs
        kpis = self.conn.execute("""
            SELECT
                COUNT(DISTINCT p.id) as total_projects,
                COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                COUNT(DISTINCT CASE WHEN p.risk_score >= 8 THEN p.id END) as high_risk_projects,
                ROUND(AVG(p.risk_score), 1) as avg_risk_score,
                SUM(p.budget_allocated) as total_budget,
                SUM(p.budget_consumed) as consumed_budget
            FROM projects p
        """).df()

        # Milestone health
        milestone_health = self.conn.execute("""
            SELECT
                status,
                health_status,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
            FROM milestones
            GROUP BY status, health_status
            ORDER BY status, health_status
        """).df()

        # Critical blockers
        critical_blockers = self.conn.execute("""
            SELECT
                t.title,
                t.status,
                u.full_name as assigned_to,
                p.name as project_name,
                tc.comment_text as blocker_reason
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN milestones m ON t.milestone_id = m.id
            JOIN projects p ON m.project_id = p.id
            LEFT JOIN task_comments tc ON t.id = tc.task_id AND tc.is_blocker_reason = true
            WHERE t.status = 'blocked' AND t.priority = 'critical'
            LIMIT 5
        """).df()

        print("\n📈 HIGH-LEVEL KPIs:")
        for _, row in kpis.iterrows():
            budget_utilization = (row['consumed_budget'] / row['total_budget'] * 100) if row['total_budget'] > 0 else 0
            print(f"  • Total Projects: {row['total_projects']} ({row['active_projects']} active)")
            print(f"  • High Risk Projects: {row['high_risk_projects']} (avg risk: {row['avg_risk_score']}/10)")
            print(f"  • Budget Utilization: {budget_utilization:.1f}% (${row['consumed_budget']:,.0f}/${row['total_budget']:,.0f})")

        print("\n🎯 MILESTONE HEALTH:")
        for _, row in milestone_health.iterrows():
            print(f"  • {row['status'].title()} ({row['health_status']}): {row['count']} milestones ({row['percentage']}%)")

        print("\n🚨 CRITICAL BLOCKERS:")
        if len(critical_blockers) == 0:
            print("  • No critical blockers found! 🎉")
        else:
            for _, row in critical_blockers.iterrows():
                print(f"  • {row['title'][:50]}... (Project: {row['project_name']})")
                print(f"    Assigned to: {row['assigned_to']}")
                if pd.notna(row['blocker_reason']):
                    print(f"    Blocker: {row['blocker_reason'][:80]}...")

        print("\n🎛️ AVAILABLE ACTIONS:")
        print("  [Escalate] - Send urgent message to project leads")
        print("  [Reallocate] - Move resources between projects")
        print("  [Emergency Meeting] - Schedule immediate stakeholder sync")
        print("  [Risk Review] - Deep dive into high-risk projects")
        print("  [Budget Override] - Approve additional resources")

        print("\n💡 UI COMPONENTS NEEDED:")
        print("  • KPI cards with trend arrows and click-to-drill capability")
        print("  • Interactive risk heatmap by department/project")
        print("  • One-click action buttons for each blocker")
        print("  • Drag-and-drop resource allocation interface")
        print("  • Real-time notification center for escalations")

    def dependency_detective(self, user_name="Mike Rodriguez (Engineering Lead)", focus_project="Mobile App 2.0"):
        """
        Scene 2: The Unblocker Interface
        Query: "What's blocking the mobile app release and help me unblock it"
        """
        print(f"\n🔍 === DEPENDENCY DETECTIVE for {user_name} ===")
        print("VIEW: The Unblocker Interface")
        print(f"QUERY: 'What's blocking the {focus_project} release and help me unblock it'")

        # Find the project
        project_info = self.conn.execute("""
            SELECT id, name, status, target_end_date, risk_score
            FROM projects
            WHERE name LIKE ?
        """, [f"%{focus_project}%"]).df()

        if len(project_info) == 0:
            print(f"❌ Project '{focus_project}' not found. Available projects:")
            projects = self.conn.execute("SELECT name FROM projects ORDER BY name").df()
            for _, p in projects.iterrows():
                print(f"  • {p['name']}")
            return

        project_id = int(project_info.iloc[0]['id'])
        print(f"\n📱 PROJECT: {project_info.iloc[0]['name']}")
        print(f"  Status: {project_info.iloc[0]['status']} | Risk: {project_info.iloc[0]['risk_score']}/10")
        print(f"  Target End: {project_info.iloc[0]['target_end_date']}")

        # Blocking dependencies
        blocking_tasks = self.conn.execute("""
            SELECT
                blocking_task.id as blocking_task_id,
                blocking_task.title as blocking_task,
                blocking_task.status as blocking_status,
                blocking_task.assigned_to as blocking_assigned_to,
                blocker_user.full_name as blocker_name,
                blocker_user.email as blocker_email,
                blocked_task.title as blocked_task,
                blocked_task.assigned_to as blocked_assigned_to,
                blocked_user.full_name as blocked_name,
                td.dependency_type
            FROM task_dependencies td
            JOIN tasks blocking_task ON td.depends_on_task_id = blocking_task.id
            JOIN tasks blocked_task ON td.task_id = blocked_task.id
            JOIN milestones m1 ON blocking_task.milestone_id = m1.id
            JOIN milestones m2 ON blocked_task.milestone_id = m2.id
            JOIN users blocker_user ON blocking_task.assigned_to = blocker_user.id
            JOIN users blocked_user ON blocked_task.assigned_to = blocked_user.id
            WHERE m1.project_id = ? OR m2.project_id = ?
            ORDER BY td.dependency_type, blocking_task.status
        """, [project_id, project_id]).df()

        # Blocked tasks in project
        project_blocked_tasks = self.conn.execute("""
            SELECT
                t.id,
                t.title,
                t.status,
                u.full_name as assigned_to,
                u.email,
                tc.comment_text as blocker_reason,
                t.due_date
            FROM tasks t
            JOIN milestones m ON t.milestone_id = m.id
            JOIN users u ON t.assigned_to = u.id
            LEFT JOIN task_comments tc ON t.id = tc.task_id AND tc.is_blocker_reason = true
            WHERE m.project_id = ? AND t.status = 'blocked'
            ORDER BY t.due_date
        """, [project_id]).df()

        print(f"\n🔗 BLOCKING DEPENDENCIES ({len(blocking_tasks)} found):")
        if len(blocking_tasks) == 0:
            print("  • No dependency blockers found!")
        else:
            for _, row in blocking_tasks.iterrows():
                print(f"  • BLOCKER: {row['blocking_task'][:50]}...")
                print(f"    Status: {row['blocking_status']} | Owner: {row['blocker_name']} ({row['blocker_email']})")
                print(f"    BLOCKS: {row['blocked_task'][:50]}... (Owner: {row['blocked_name']})")
                print(f"    Type: {row['dependency_type']}")
                print()

        print(f"\n🚧 BLOCKED TASKS IN PROJECT ({len(project_blocked_tasks)} found):")
        if len(project_blocked_tasks) == 0:
            print("  • No blocked tasks in this project!")
        else:
            for _, row in project_blocked_tasks.iterrows():
                print(f"  • {row['title'][:60]}...")
                print(f"    Assigned: {row['assigned_to']} | Due: {row['due_date']}")
                if pd.notna(row['blocker_reason']):
                    print(f"    Reason: {row['blocker_reason'][:80]}...")
                print()

        print("\n🛠️ AVAILABLE ACTIONS:")
        print("  [Message Owner] - Direct message to blocking task owner")
        print("  [Create Workaround] - Generate alternative approach task")
        print("  [Escalate] - Notify manager about critical blocker")
        print("  [Schedule Sync] - Book time with blocking team")
        print("  [Split Task] - Break large blocking task into smaller parts")
        print("  [Change Priority] - Request priority override for blockers")

        print("\n💡 UI COMPONENTS NEEDED:")
        print("  • Interactive dependency graph with hover actions")
        print("  • Color-coded task status (red=blocked, yellow=at-risk)")
        print("  • Quick communication panels for each blocker")
        print("  • Timeline view showing critical path impacts")
        print("  • Suggested workaround generator with AI assistance")

    def resource_balancer(self, user_name="Priya Patel (Resource Manager)"):
        """
        Scene 3: The Load Balancer
        Query: "Who's overloaded next week and let me fix it"
        """
        print(f"\n⚖️ === RESOURCE BALANCER for {user_name} ===")
        print("VIEW: The Load Balancer")
        print("QUERY: 'Who's overloaded next week and let me fix it'")

        # Team allocation analysis
        team_allocation = self.conn.execute("""
            SELECT
                u.id,
                u.full_name,
                u.role,
                d.name as department,
                u.availability_hours_per_week,
                SUM(tm.allocation_percentage) as total_allocation,
                COUNT(DISTINCT tm.team_id) as num_teams
            FROM users u
            JOIN departments d ON u.department_id = d.id
            JOIN team_members tm ON u.id = tm.user_id
            GROUP BY u.id, u.full_name, u.role, d.name, u.availability_hours_per_week
            ORDER BY total_allocation DESC
        """).df()

        # Task workload for next week (simulated)
        upcoming_workload = self.conn.execute("""
            SELECT
                u.id,
                u.full_name,
                COUNT(t.id) as active_tasks,
                SUM(CASE WHEN t.status = 'todo' THEN t.estimated_hours ELSE 0 END) as pending_hours,
                SUM(CASE WHEN t.status = 'in_progress' THEN t.estimated_hours ELSE 0 END) as active_hours,
                SUM(t.estimated_hours) as total_estimated_hours
            FROM users u
            LEFT JOIN tasks t ON u.id = t.assigned_to
                AND t.status IN ('todo', 'in_progress', 'blocked')
            GROUP BY u.id, u.full_name
            HAVING COUNT(t.id) > 0
            ORDER BY total_estimated_hours DESC
        """).df()

        # Overloaded users (>100% allocation or >40 hours)
        overloaded = team_allocation[
            (team_allocation['total_allocation'] > 100) |
            (team_allocation['availability_hours_per_week'] < 40)
        ]

        print(f"\n🔥 OVERLOADED USERS ({len(overloaded)} found):")
        if len(overloaded) == 0:
            print("  • No overloaded users found!")
        else:
            for _, row in overloaded.iterrows():
                print(f"  • {row['full_name']} ({row['role']})")
                print(f"    Dept: {row['department']} | Allocation: {row['total_allocation']}%")
                print(f"    Available: {row['availability_hours_per_week']}h/week | Teams: {row['num_teams']}")

                # Get their task details
                user_tasks = upcoming_workload[upcoming_workload['id'] == row['id']]
                if len(user_tasks) > 0:
                    task_info = user_tasks.iloc[0]
                    print(f"    Tasks: {task_info['active_tasks']} active ({task_info['total_estimated_hours']:.1f}h estimated)")
                print()

        print(f"\n⏰ WORKLOAD ANALYSIS (Top 10 by estimated hours):")
        top_workload = upcoming_workload.head(10)
        for _, row in top_workload.iterrows():
            utilization = (row['total_estimated_hours'] / 40) * 100  # Assuming 40h work week
            status = "🔥 OVERLOADED" if utilization > 100 else "⚠️  HIGH" if utilization > 80 else "✅ NORMAL"
            print(f"  • {row['full_name']}: {row['total_estimated_hours']:.1f}h ({utilization:.0f}%) {status}")
            print(f"    Active: {row['active_tasks']} tasks | Pending: {row['pending_hours']:.1f}h | In Progress: {row['active_hours']:.1f}h")

        # Skills analysis for rebalancing
        skills_distribution = self.conn.execute("""
            SELECT
                specialization,
                role,
                COUNT(*) as people_count,
                AVG(availability_hours_per_week) as avg_availability
            FROM users
            GROUP BY specialization, role
            ORDER BY specialization, people_count DESC
        """).df()

        print(f"\n🎯 SKILLS AVAILABILITY for Rebalancing:")
        for _, row in skills_distribution.iterrows():
            print(f"  • {row['specialization']} ({row['role']}): {row['people_count']} people, avg {row['avg_availability']:.0f}h/week")

        print("\n🛠️ AVAILABLE ACTIONS:")
        print("  [Drag & Drop] - Move tasks between team members")
        print("  [Auto-Suggest] - AI-powered workload rebalancing")
        print("  [Request Overtime] - Get approval for extra hours")
        print("  [Find Contractor] - Search external resources")
        print("  [Bulk Reschedule] - Move multiple deadlines")
        print("  [Skill Match] - Find people with required skills")

        print("\n💡 UI COMPONENTS NEEDED:")
        print("  • Team capacity heat map with drag-and-drop tasks")
        print("  • Skills matrix overlay for reallocation suggestions")
        print("  • Real-time workload calculations as tasks move")
        print("  • Integration with HR systems for contractor requests")
        print("  • Bulk editing interface with undo/redo capabilities")

    def personal_assistant(self, user_name="James Liu (Developer)", user_id=None):
        """
        Scene 4: The Execution Pod
        Query: "What should I focus on today and let me get started"
        """
        print(f"\n🎯 === PERSONAL ASSISTANT for {user_name} ===")
        print("VIEW: The Execution Pod")
        print("QUERY: 'What should I focus on today and let me get started'")

        # Find user if ID not provided
        if user_id is None:
            # Get a developer user
            user_info = self.conn.execute("""
                SELECT id, full_name, role, specialization
                FROM users
                WHERE role IN ('junior', 'senior', 'lead')
                LIMIT 1
            """).df()
            if len(user_info) == 0:
                print("❌ No developer users found")
                return
            user_id = int(user_info.iloc[0]['id'])
            actual_name = user_info.iloc[0]['full_name']
            role = user_info.iloc[0]['role']
            specialization = user_info.iloc[0]['specialization']
            print(f"📱 USER: {actual_name} ({role}, {specialization})")

        # Personal task list with context
        personal_tasks = self.conn.execute("""
            SELECT
                t.id,
                t.title,
                t.status,
                t.priority,
                t.estimated_hours,
                t.due_date,
                t.start_date,
                m.name as milestone_name,
                p.name as project_name,
                p.priority as project_priority,
                assigner.full_name as assigned_by_name,
                CASE
                    WHEN t.due_date < CURRENT_DATE THEN 'OVERDUE'
                    WHEN t.due_date <= CURRENT_DATE + INTERVAL 2 DAY THEN 'DUE_SOON'
                    ELSE 'NORMAL'
                END as urgency
            FROM tasks t
            JOIN milestones m ON t.milestone_id = m.id
            JOIN projects p ON m.project_id = p.id
            JOIN users assigner ON t.assigned_by = assigner.id
            WHERE t.assigned_to = ?
            AND t.status IN ('todo', 'in_progress', 'blocked')
            ORDER BY
                CASE t.priority
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    ELSE 4
                END,
                t.due_date
        """, [user_id]).df()

        # Dependencies on user's work
        dependencies_on_me = self.conn.execute("""
            SELECT
                waiting_task.title as waiting_task,
                waiting_task.assigned_to as waiting_user_id,
                waiting_user.full_name as waiting_user,
                my_task.title as my_task,
                my_task.status as my_task_status,
                td.dependency_type
            FROM task_dependencies td
            JOIN tasks my_task ON td.depends_on_task_id = my_task.id
            JOIN tasks waiting_task ON td.task_id = waiting_task.id
            JOIN users waiting_user ON waiting_task.assigned_to = waiting_user.id
            WHERE my_task.assigned_to = ?
            AND my_task.status != 'completed'
            ORDER BY waiting_task.due_date
        """, [user_id]).df()

        # Recent work context
        recent_activity = self.conn.execute("""
            SELECT
                wl.log_date,
                wl.hours_logged,
                wl.description,
                t.title as task_title
            FROM work_logs wl
            JOIN tasks t ON wl.task_id = t.id
            WHERE wl.user_id = ?
            AND wl.log_date >= CURRENT_DATE - INTERVAL 7 DAY
            ORDER BY wl.log_date DESC
            LIMIT 5
        """, [user_id]).df()

        print(f"\n📋 TODAY'S FOCUS ({len(personal_tasks)} active tasks):")
        if len(personal_tasks) == 0:
            print("  • No active tasks! Time to pick up something new 🎉")
        else:
            for i, row in personal_tasks.head(5).iterrows():
                urgency_icon = "🔥" if row['urgency'] == 'OVERDUE' else "⚠️" if row['urgency'] == 'DUE_SOON' else "📅"
                priority_icon = "🚨" if row['priority'] == 'critical' else "📈" if row['priority'] == 'high' else "📋"

                print(f"  {i+1}. {priority_icon} {row['title'][:60]}...")
                print(f"     Project: {row['project_name']} → {row['milestone_name']}")
                print(f"     Status: {row['status']} | Priority: {row['priority']} | Est: {row['estimated_hours']:.1f}h")
                print(f"     Due: {row['due_date']} {urgency_icon} | Assigned by: {row['assigned_by_name']}")
                print()

        print(f"\n👥 PEOPLE WAITING ON MY WORK ({len(dependencies_on_me)} found):")
        if len(dependencies_on_me) == 0:
            print("  • No one is blocked by your work!")
        else:
            for _, row in dependencies_on_me.iterrows():
                print(f"  • {row['waiting_user']} is waiting for: {row['my_task'][:50]}...")
                print(f"    Their task: {row['waiting_task'][:50]}...")
                print(f"    My task status: {row['my_task_status']} | Dependency: {row['dependency_type']}")

        print(f"\n📊 RECENT ACTIVITY (last 7 days):")
        if len(recent_activity) == 0:
            print("  • No recent work logged")
        else:
            total_hours = recent_activity['hours_logged'].sum()
            print(f"  • Total logged: {total_hours:.1f} hours this week")
            for _, row in recent_activity.head(3).iterrows():
                print(f"  • {row['log_date']}: {row['hours_logged']:.1f}h on {row['task_title'][:40]}...")

        print("\n🛠️ AVAILABLE ACTIONS:")
        print("  [Start Work] - Begin focus mode with timer")
        print("  [I'm Blocked] - Generate blocker report")
        print("  [Need Help] - Find available team members")
        print("  [Complete & Next] - Mark done and auto-pick next task")
        print("  [Quick Update] - Send status to stakeholders")
        print("  [Focus Mode] - Hide distractions, show only current task")

        print("\n💡 UI COMPONENTS NEEDED:")
        print("  • Kanban-style personal board with drag-to-update status")
        print("  • Integrated timer with automatic work logging")
        print("  • Context-aware documentation and code links")
        print("  • Quick communication panel for stakeholders")
        print("  • AI suggestions for next task based on skills/priority")

    def cross_functional_coordinator(self, user_name="Ana Silva (Product Manager)", project_name="Customer Portal"):
        """
        Scene 5: The Orchestration Hub
        Query: "Show me the customer portal project across all teams"
        """
        print(f"\n🎼 === CROSS-FUNCTIONAL COORDINATOR for {user_name} ===")
        print("VIEW: The Orchestration Hub")
        print(f"QUERY: 'Show me the {project_name} project across all teams'")

        # Find project
        project_info = self.conn.execute("""
            SELECT id, name, status, start_date, target_end_date, priority
            FROM projects
            WHERE name LIKE ?
        """, [f"%{project_name}%"]).df()

        if len(project_info) == 0:
            print(f"❌ Project '{project_name}' not found")
            return

        project_id = int(project_info.iloc[0]['id'])
        print(f"\n🚀 PROJECT: {project_info.iloc[0]['name']}")
        print(f"  Status: {project_info.iloc[0]['status']} | Priority: {project_info.iloc[0]['priority']}")
        print(f"  Timeline: {project_info.iloc[0]['start_date']} → {project_info.iloc[0]['target_end_date']}")

        # Team progress across departments
        team_progress = self.conn.execute("""
            SELECT
                d.name as department,
                d.type,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as blocked_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as active_tasks,
                ROUND(AVG(CASE WHEN t.status = 'completed' THEN 100.0 ELSE
                    CASE WHEN t.status = 'in_progress' THEN 50.0 ELSE 0.0 END END), 1) as progress_pct
            FROM departments d
            JOIN users u ON d.id = u.department_id
            JOIN tasks t ON u.id = t.assigned_to
            JOIN milestones m ON t.milestone_id = m.id
            WHERE m.project_id = ?
            GROUP BY d.id, d.name, d.type
            ORDER BY progress_pct DESC
        """, [project_id]).df()

        # Handoff points and dependencies
        cross_team_deps = self.conn.execute("""
            SELECT
                giver_dept.name as giver_department,
                receiver_dept.name as receiver_department,
                giver_task.title as giver_task,
                receiver_task.title as receiver_task,
                giver_task.status as giver_status,
                receiver_task.status as receiver_status,
                giver_user.full_name as giver_name,
                receiver_user.full_name as receiver_name,
                td.dependency_type
            FROM task_dependencies td
            JOIN tasks giver_task ON td.depends_on_task_id = giver_task.id
            JOIN tasks receiver_task ON td.task_id = receiver_task.id
            JOIN users giver_user ON giver_task.assigned_to = giver_user.id
            JOIN users receiver_user ON receiver_task.assigned_to = receiver_user.id
            JOIN departments giver_dept ON giver_user.department_id = giver_dept.id
            JOIN departments receiver_dept ON receiver_user.department_id = receiver_dept.id
            JOIN milestones gm ON giver_task.milestone_id = gm.id
            JOIN milestones rm ON receiver_task.milestone_id = rm.id
            WHERE (gm.project_id = ? OR rm.project_id = ?)
            AND giver_dept.id != receiver_dept.id
            ORDER BY giver_dept.name, receiver_dept.name
        """, [project_id, project_id]).df()

        # Recent team comments/communication
        team_communications = self.conn.execute("""
            SELECT
                d.name as department,
                u.full_name as commenter,
                tc.comment_text,
                tc.created_at,
                t.title as task_title
            FROM task_comments tc
            JOIN users u ON tc.user_id = u.id
            JOIN departments d ON u.department_id = d.id
            JOIN tasks t ON tc.task_id = t.id
            JOIN milestones m ON t.milestone_id = m.id
            WHERE m.project_id = ?
            AND tc.created_at >= CURRENT_DATE - INTERVAL 7 DAY
            ORDER BY tc.created_at DESC
            LIMIT 10
        """, [project_id]).df()

        print(f"\n📊 TEAM PROGRESS SWIMLANES:")
        for _, row in team_progress.iterrows():
            progress_bar = "█" * int(row['progress_pct'] // 10) + "░" * (10 - int(row['progress_pct'] // 10))
            status_icon = "🔥" if row['blocked_tasks'] > 0 else "🚀" if row['progress_pct'] > 75 else "⚠️" if row['progress_pct'] < 25 else "📈"

            print(f"  {status_icon} {row['department']}: {progress_bar} {row['progress_pct']}%")
            print(f"     Tasks: {row['completed_tasks']}/{row['total_tasks']} done, {row['active_tasks']} active, {row['blocked_tasks']} blocked")

        print(f"\n🔄 CROSS-TEAM HANDOFFS ({len(cross_team_deps)} found):")
        if len(cross_team_deps) == 0:
            print("  • No cross-team dependencies found")
        else:
            for _, row in cross_team_deps.iterrows():
                handoff_status = "✅ READY" if row['giver_status'] == 'completed' else "⏳ WAITING" if row['giver_status'] == 'in_progress' else "🚫 BLOCKED"
                print(f"  • {row['giver_department']} → {row['receiver_department']} {handoff_status}")
                print(f"    Gives: {row['giver_task'][:50]}... ({row['giver_status']}) - {row['giver_name']}")
                print(f"    Receives: {row['receiver_task'][:50]}... ({row['receiver_status']}) - {row['receiver_name']}")
                print()

        print(f"\n💬 RECENT TEAM COMMUNICATION:")
        if len(team_communications) == 0:
            print("  • No recent comments")
        else:
            for _, row in team_communications.head(5).iterrows():
                print(f"  • [{row['department']}] {row['commenter']}: {row['comment_text'][:60]}...")
                print(f"    On task: {row['task_title'][:40]}... | {row['created_at']}")

        print("\n🛠️ AVAILABLE ACTIONS:")
        print("  [Send Status Request] - Ask all teams for updates")
        print("  [Create Handoff Meeting] - Schedule team-to-team sync")
        print("  [Flag Handoff Ready] - Notify receiving team")
        print("  [Escalate Blocker] - Get management help")
        print("  [Cross-Team Task] - Create shared deliverable")
        print("  [Bulk Update] - Change multiple team milestones")

        print("\n💡 UI COMPONENTS NEEDED:")
        print("  • Swimlane view with team progress bars")
        print("  • Interactive handoff timeline with status indicators")
        print("  • Team communication threads per deliverable")
        print("  • Drag-and-drop milestone adjustment interface")
        print("  • Notification center for cross-team updates")

    def run_all_demos(self):
        """Run all demo scenarios in sequence"""
        print("🎭 === RUNNING ALL DEMO SCENARIOS ===")
        print("Demonstrating different personas and their action-oriented views\n")

        try:
            self.executive_dashboard()
            self.dependency_detective()
            self.resource_balancer()
            self.personal_assistant()
            self.cross_functional_coordinator()

            print("\n" + "="*70)
            print("🎯 DEMO COMPLETE! Key Takeaways:")
            print("  • Same data, completely different interfaces per persona")
            print("  • Every view includes actionable next steps")
            print("  • Context-aware actions based on user role and current state")
            print("  • Real-time collaboration and communication built-in")
            print("  • AI-powered suggestions and automation capabilities")
            print("\n💡 This demonstrates the power of generative UI:")
            print("  Instead of one-size-fits-all dashboards, each user gets")
            print("  a personalized command center designed for their specific")
            print("  role, responsibilities, and current context!")

        except Exception as e:
            print(f"❌ Error running demos: {e}")
            import traceback
            traceback.print_exc()

def main():
    """Main entry point for the analysis module"""
    try:
        with PlanningAnalyzer() as analyzer:
            analyzer.run_all_demos()
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print("Please run generate_demo_data.py first to create the database.")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()