#!/usr/bin/env python3
"""
Demo Data Generation for Planning System
Generates realistic demo data with auto-increment integer IDs
"""

import duckdb
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date
import random
from faker import Faker
import json

# Initialize
fake = Faker()
random.seed(42)  # For repeatability
np.random.seed(42)
Faker.seed(42)

# ID counters for auto-increment
id_counters = {
    'organizations': 0,
    'departments': 0,
    'users': 0,
    'teams': 0,
    'projects': 0,
    'milestones': 0,
    'tasks': 0,
    'task_dependencies': 0,
    'task_comments': 0,
    'work_logs': 0,
    'resource_requests': 0,
    'notifications': 0
}

def next_id(table_name):
    """Get next auto-increment ID for a table"""
    id_counters[table_name] += 1
    return id_counters[table_name]

# Configuration
ORGANIZATION_CONFIG = {
    "count": 1,
    "name": "TechVision Corp"
}

DEPARTMENTS_CONFIG = {
    "distribution": [
        {"name": "Engineering", "type": "engineering", "weight": 0.4},
        {"name": "Design", "type": "design", "weight": 0.15},
        {"name": "Product", "type": "product", "weight": 0.15},
        {"name": "Sales", "type": "sales", "weight": 0.1},
        {"name": "Operations", "type": "operations", "weight": 0.1},
        {"name": "Finance", "type": "finance", "weight": 0.05},
        {"name": "Compliance", "type": "compliance", "weight": 0.05}
    ]
}

USERS_CONFIG = {
    "total_count": 150,
    "role_distribution": {
        "ceo": {"count": 1, "availability": 40},
        "vp": {"count": 7, "availability": 45},
        "manager": {"count": 20, "availability": 40},
        "lead": {"count": 25, "availability": 40},
        "senior": {"count": 40, "availability": 40},
        "junior": {"count": 45, "availability": 40},
        "intern": {"count": 12, "availability": 20}
    },
    "specialization_by_department": {
        "engineering": ["frontend", "backend", "fullstack", "devops", "data"],
        "design": ["ui_ux", "product"],
        "product": ["product", "business"],
        "sales": ["business"],
        "operations": ["business", "data"],
        "finance": ["business"],
        "compliance": ["business"]
    },
    "timezone_distribution": {
        "PST": 0.4, "EST": 0.3, "CST": 0.15, "GMT": 0.1, "IST": 0.05
    },
    "overload_patterns": [
        {"user_indices": [30, 45, 67], "overload_factor": 1.5},
        {"user_indices": [88, 92], "overload_factor": 1.3}
    ]
}

TEAMS_CONFIG = {
    "teams_per_department": {
        "engineering": 8,
        "design": 3,
        "product": 3,
        "sales": 2,
        "operations": 2,
        "finance": 1,
        "compliance": 1
    }
}

PROJECTS_CONFIG = {
    "count": 25,
    "templates": [
        {
            "name": "Mobile App 2.0", "code_name": "Phoenix",
            "priority": "critical", "status": "active",
            "risk_score": 8, "client_facing": True,
            "budget": 500000, "budget_consumed_ratio": 0.7
        },
        {
            "name": "Enterprise API Platform", "code_name": "Atlas",
            "priority": "high", "status": "active",
            "risk_score": 6, "client_facing": True,
            "budget": 800000, "budget_consumed_ratio": 0.4
        },
        {
            "name": "SOC2 Compliance Initiative", "code_name": "Shield",
            "priority": "critical", "status": "active",
            "risk_score": 9, "compliance_required": True,
            "budget": 200000, "budget_consumed_ratio": 0.6
        },
        {
            "name": "Customer Portal", "code_name": "Gateway",
            "priority": "high", "status": "active",
            "risk_score": 5, "client_facing": True
        }
    ],
    "status_distribution": {
        "active": 0.6,
        "planning": 0.15,
        "on_hold": 0.1,
        "completed": 0.1,
        "cancelled": 0.05
    },
    "priority_distribution": {
        "critical": 0.15,
        "high": 0.35,
        "medium": 0.35,
        "low": 0.15
    }
}

def create_schema(conn):
    """Create all database tables with simple INTEGER PRIMARY KEY"""

    conn.execute("DROP TABLE IF EXISTS notifications")
    conn.execute("DROP TABLE IF EXISTS resource_requests")
    conn.execute("DROP TABLE IF EXISTS work_logs")
    conn.execute("DROP TABLE IF EXISTS task_tags")
    conn.execute("DROP TABLE IF EXISTS task_comments")
    conn.execute("DROP TABLE IF EXISTS task_dependencies")
    conn.execute("DROP TABLE IF EXISTS tasks")
    conn.execute("DROP TABLE IF EXISTS milestones")
    conn.execute("DROP TABLE IF EXISTS projects")
    conn.execute("DROP TABLE IF EXISTS team_members")
    conn.execute("DROP TABLE IF EXISTS teams")
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute("DROP TABLE IF EXISTS departments")
    conn.execute("DROP TABLE IF EXISTS organizations")

    sql_schema = """
    CREATE TABLE organizations (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50)
    );

    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        department_id INTEGER REFERENCES departments(id),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50),
        specialization VARCHAR(50),
        availability_hours_per_week INTEGER DEFAULT 40,
        timezone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE teams (
        id INTEGER PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id),
        name VARCHAR(255) NOT NULL,
        lead_user_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE team_members (
        team_id INTEGER REFERENCES teams(id),
        user_id INTEGER REFERENCES users(id),
        allocation_percentage INTEGER DEFAULT 100,
        PRIMARY KEY (team_id, user_id)
    );

    CREATE TABLE projects (
        id INTEGER PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        name VARCHAR(255) NOT NULL,
        code_name VARCHAR(50),
        status VARCHAR(50),
        priority VARCHAR(20),
        start_date DATE,
        target_end_date DATE,
        actual_end_date DATE,
        budget_allocated DECIMAL(12, 2),
        budget_consumed DECIMAL(12, 2),
        risk_score INTEGER,
        compliance_required BOOLEAN DEFAULT FALSE,
        client_facing BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE milestones (
        id INTEGER PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        name VARCHAR(255) NOT NULL,
        due_date DATE,
        status VARCHAR(50),
        completion_percentage INTEGER DEFAULT 0,
        is_critical_path BOOLEAN DEFAULT FALSE,
        health_status VARCHAR(20)
    );

    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY,
        milestone_id INTEGER REFERENCES milestones(id),
        parent_task_id INTEGER REFERENCES tasks(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50),
        priority VARCHAR(20),
        assigned_to INTEGER REFERENCES users(id),
        assigned_by INTEGER REFERENCES users(id),
        estimated_hours DECIMAL(5, 2),
        actual_hours DECIMAL(5, 2),
        start_date DATE,
        due_date DATE,
        completed_at TIMESTAMP,
        task_type VARCHAR(50),
        requires_compliance_check BOOLEAN DEFAULT FALSE,
        is_blocking BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE task_dependencies (
        id INTEGER PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id),
        depends_on_task_id INTEGER REFERENCES tasks(id),
        dependency_type VARCHAR(50),
        is_hard_dependency BOOLEAN DEFAULT TRUE,
        UNIQUE(task_id, depends_on_task_id)
    );

    CREATE TABLE task_comments (
        id INTEGER PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id),
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT,
        is_blocker_reason BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE task_tags (
        task_id INTEGER REFERENCES tasks(id),
        tag VARCHAR(50),
        PRIMARY KEY (task_id, tag)
    );

    CREATE TABLE work_logs (
        id INTEGER PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id),
        user_id INTEGER REFERENCES users(id),
        hours_logged DECIMAL(4, 2),
        log_date DATE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE resource_requests (
        id INTEGER PRIMARY KEY,
        requested_by INTEGER REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id),
        request_type VARCHAR(50),
        urgency VARCHAR(20),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE notifications (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50),
        entity_type VARCHAR(50),
        entity_id INTEGER,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        action_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
    CREATE INDEX idx_tasks_status ON tasks(status);
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX idx_milestones_project ON milestones(project_id);
    CREATE INDEX idx_dependencies_task ON task_dependencies(task_id);
    CREATE INDEX idx_dependencies_depends_on ON task_dependencies(depends_on_task_id);
    """

    for statement in sql_schema.split(';'):
        if statement.strip():
            conn.execute(statement)

    print("📊 Schema created successfully")

def generate_demo_data():
    """Main function to generate all demo data"""

    print("🚀 Starting demo data generation...")

    # Connect to DuckDB
    conn = duckdb.connect('generated/planning_demo.duckdb')

    # Create schema
    create_schema(conn)

    # Generate data in order
    org_id = generate_organizations(conn)
    departments = generate_departments(conn, org_id)
    users = generate_users(conn, org_id, departments)
    teams = generate_teams(conn, departments, users)
    generate_team_members(conn, teams, users)
    projects = generate_projects(conn, org_id)
    milestones = generate_milestones(conn, projects)
    tasks = generate_tasks(conn, milestones, users)
    generate_task_dependencies(conn, tasks)
    generate_task_comments(conn, tasks, users)
    generate_task_tags(conn, tasks)
    generate_work_logs(conn, tasks, users)
    generate_resource_requests(conn, users, projects)
    generate_notifications(conn, users, tasks, projects, milestones)

    # Validate demo scenarios
    validate_scenarios(conn)

    # Generate manifest
    generate_manifest(conn)

    print("✅ Demo data generation complete!")

    conn.close()

def generate_organizations(conn):
    """Generate organization data"""
    org_id = next_id('organizations')

    conn.execute("""
        INSERT INTO organizations (id, name, created_at)
        VALUES (?, ?, ?)
    """, [org_id, ORGANIZATION_CONFIG["name"], datetime.now()])

    print(f"🏢 Created organization: {ORGANIZATION_CONFIG['name']}")
    return org_id

def generate_departments(conn, org_id):
    """Generate department data"""
    departments = []

    for dept in DEPARTMENTS_CONFIG["distribution"]:
        dept_id = next_id('departments')

        departments.append({
            "id": dept_id,
            "organization_id": org_id,
            "name": dept["name"],
            "type": dept["type"]
        })

        conn.execute("""
            INSERT INTO departments (id, organization_id, name, type)
            VALUES (?, ?, ?, ?)
        """, [dept_id, org_id, dept["name"], dept["type"]])

    print(f"🏬 Created {len(departments)} departments")
    return departments

def generate_users(conn, org_id, departments):
    """Generate user data with specific overload patterns"""
    users = []
    user_index = 0

    # Distribute users across departments based on weights
    dept_user_counts = {}
    total_users = USERS_CONFIG["total_count"]

    for dept in departments:
        weight = next(d["weight"] for d in DEPARTMENTS_CONFIG["distribution"]
                     if d["type"] == dept["type"])
        dept_user_counts[dept["id"]] = int(total_users * weight)

    # Adjust for rounding
    diff = total_users - sum(dept_user_counts.values())
    if diff > 0:
        first_dept = list(dept_user_counts.keys())[0]
        dept_user_counts[first_dept] += diff

    # Generate users by role
    for role, config in USERS_CONFIG["role_distribution"].items():
        for _ in range(config["count"]):
            # Assign department
            dept_id = None
            for did, count in dept_user_counts.items():
                if count > 0:
                    dept_id = did
                    dept_user_counts[did] -= 1
                    break

            if dept_id is None:
                dept_id = random.choice(list(dept_user_counts.keys()))

            # Get department type for specialization
            dept_type = next(d["type"] for d in departments if d["id"] == dept_id)
            specializations = USERS_CONFIG["specialization_by_department"].get(dept_type, ["business"])

            # Select timezone
            timezone = np.random.choice(
                list(USERS_CONFIG["timezone_distribution"].keys()),
                p=list(USERS_CONFIG["timezone_distribution"].values())
            )

            user_id = next_id('users')
            full_name = fake.name()
            email = f"{full_name.lower().replace(' ', '.')}@techvision.com"
            specialization = random.choice(specializations)

            users.append({
                "id": user_id,
                "organization_id": org_id,
                "department_id": dept_id,
                "email": email,
                "full_name": full_name,
                "role": role,
                "specialization": specialization,
                "availability_hours_per_week": config["availability"],
                "timezone": timezone,
                "index": user_index
            })

            conn.execute("""
                INSERT INTO users (id, organization_id, department_id, email, full_name,
                                 role, specialization, availability_hours_per_week, timezone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [user_id, org_id, dept_id, email, full_name, role,
                 specialization, config["availability"], timezone])

            user_index += 1

    print(f"👥 Created {len(users)} users")
    return users

def generate_teams(conn, departments, users):
    """Generate team data"""
    teams = []

    for dept in departments:
        num_teams = TEAMS_CONFIG["teams_per_department"].get(dept["type"], 1)
        dept_users = [u for u in users if u["department_id"] == dept["id"]]

        team_names = {
            "engineering": ["Frontend", "Backend", "Mobile", "DevOps", "Data", "API", "Security", "Platform"],
            "design": ["Product Design", "Brand", "Research"],
            "product": ["B2B", "B2C", "Platform"],
            "sales": ["Enterprise", "SMB"],
            "operations": ["Infrastructure", "Process"],
            "finance": ["Finance"],
            "compliance": ["Compliance"]
        }

        for i in range(min(num_teams, len(team_names.get(dept["type"], ["Team"])))):
            team_id = next_id('teams')
            team_name = team_names.get(dept["type"], ["Team"])[i] if dept["type"] in team_names else f"Team {i+1}"

            # Find a lead user
            lead_candidates = [u for u in dept_users if u["role"] in ["lead", "manager", "senior"]]
            lead_user = random.choice(lead_candidates) if lead_candidates else (dept_users[0] if dept_users else None)

            teams.append({
                "id": team_id,
                "department_id": dept["id"],
                "name": team_name,
                "lead_user_id": lead_user["id"] if lead_user else None
            })

            conn.execute("""
                INSERT INTO teams (id, department_id, name, lead_user_id)
                VALUES (?, ?, ?, ?)
            """, [team_id, dept["id"], team_name, lead_user["id"] if lead_user else None])

    print(f"👨‍👩‍👧‍👦 Created {len(teams)} teams")
    return teams

def generate_team_members(conn, teams, users):
    """Generate team member allocations with overload patterns"""

    # Assign users to teams
    for user in users:
        dept_teams = [t for t in teams if t["department_id"] == user["department_id"]]

        if not dept_teams:
            continue

        # Check if user should be overloaded
        overload_factor = 1.0
        for pattern in USERS_CONFIG["overload_patterns"]:
            if user["index"] in pattern["user_indices"]:
                overload_factor = pattern["overload_factor"]
                break

        # Assign to teams
        if overload_factor > 1.0:
            # Overloaded user - assign to multiple teams
            num_teams = min(int(overload_factor * 2), len(dept_teams))
            selected_teams = random.sample(dept_teams, num_teams)

            for team in selected_teams:
                allocation = int(100 / len(selected_teams) * overload_factor)
                conn.execute("""
                    INSERT INTO team_members (team_id, user_id, allocation_percentage)
                    VALUES (?, ?, ?)
                """, [team["id"], user["id"], allocation])
        else:
            # Normal allocation
            team = random.choice(dept_teams)
            conn.execute("""
                INSERT INTO team_members (team_id, user_id, allocation_percentage)
                VALUES (?, ?, ?)
            """, [team["id"], user["id"], 100])

    print(f"👨‍💼 Created team member allocations")

def generate_projects(conn, org_id):
    """Generate project data including specific demo projects"""
    projects = []

    # First, add template projects
    for template in PROJECTS_CONFIG["templates"]:
        project_id = next_id('projects')

        # Calculate dates
        start_date = date.today() - timedelta(days=random.randint(30, 180))
        duration = random.randint(60, 365)
        target_end = start_date + timedelta(days=duration)

        # Handle budget
        budget = template.get("budget", random.randint(50000, 1000000))
        budget_consumed = budget * template.get("budget_consumed_ratio", random.uniform(0.1, 0.8))

        projects.append({
            "id": project_id,
            "organization_id": org_id,
            "name": template["name"],
            "code_name": template["code_name"],
            "status": template["status"],
            "priority": template["priority"],
            "start_date": start_date,
            "target_end_date": target_end,
            "actual_end_date": target_end if template["status"] == "completed" else None,
            "budget_allocated": budget,
            "budget_consumed": budget_consumed,
            "risk_score": template["risk_score"],
            "compliance_required": template.get("compliance_required", False),
            "client_facing": template.get("client_facing", False)
        })

        conn.execute("""
            INSERT INTO projects (id, organization_id, name, code_name, status, priority,
                                start_date, target_end_date, actual_end_date,
                                budget_allocated, budget_consumed, risk_score,
                                compliance_required, client_facing)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [project_id, org_id, template["name"], template["code_name"],
              template["status"], template["priority"], start_date, target_end,
              target_end if template["status"] == "completed" else None,
              budget, budget_consumed, template["risk_score"],
              template.get("compliance_required", False),
              template.get("client_facing", False)])

    # Generate additional random projects
    remaining = PROJECTS_CONFIG["count"] - len(projects)

    for i in range(remaining):
        project_id = next_id('projects')

        # Random attributes
        status = np.random.choice(
            list(PROJECTS_CONFIG["status_distribution"].keys()),
            p=list(PROJECTS_CONFIG["status_distribution"].values())
        )

        priority = np.random.choice(
            list(PROJECTS_CONFIG["priority_distribution"].keys()),
            p=list(PROJECTS_CONFIG["priority_distribution"].values())
        )

        start_date = date.today() - timedelta(days=random.randint(30, 180))
        duration = random.randint(60, 365)
        target_end = start_date + timedelta(days=duration)

        budget = random.randint(50000, 1000000)
        budget_consumed = budget * random.uniform(0.1, 0.8)

        name = fake.catch_phrase()
        code_name = fake.word().capitalize()
        risk_score = random.randint(1, 10)
        compliance_required = random.choice([True, False])
        client_facing = random.choice([True, False])

        projects.append({
            "id": project_id,
            "organization_id": org_id,
            "name": name,
            "code_name": code_name,
            "status": status,
            "priority": priority,
            "start_date": start_date,
            "target_end_date": target_end,
            "actual_end_date": target_end if status == "completed" else None,
            "budget_allocated": budget,
            "budget_consumed": budget_consumed,
            "risk_score": risk_score,
            "compliance_required": compliance_required,
            "client_facing": client_facing
        })

        conn.execute("""
            INSERT INTO projects (id, organization_id, name, code_name, status, priority,
                                start_date, target_end_date, actual_end_date,
                                budget_allocated, budget_consumed, risk_score,
                                compliance_required, client_facing)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [project_id, org_id, name, code_name,
              status, priority, start_date, target_end,
              target_end if status == "completed" else None,
              budget, budget_consumed, risk_score,
              compliance_required, client_facing])

    print(f"📁 Created {len(projects)} projects")
    return projects

def generate_milestones(conn, projects):
    """Generate milestone data"""
    milestones = []

    for project in projects:
        num_milestones = random.randint(3, 8)

        for i in range(num_milestones):
            milestone_id = next_id('milestones')

            # Calculate dates
            project_duration = (project["target_end_date"] - project["start_date"]).days
            milestone_offset = int(project_duration * (i + 1) / (num_milestones + 1))
            due_date = project["start_date"] + timedelta(days=milestone_offset)

            # Status based on project status
            if project["status"] == "completed":
                status = "completed"
            elif project["status"] == "planning":
                status = "not_started"
            else:
                status = random.choice(["not_started", "in_progress", "completed", "delayed", "at_risk"])

            # Health status
            health_map = {
                "completed": "green",
                "in_progress": random.choice(["green", "yellow", "red"]),
                "not_started": random.choice(["green", "yellow"]),
                "delayed": random.choice(["yellow", "red"]),
                "at_risk": "red"
            }

            name = f"Milestone {i+1}: {fake.bs()}"
            completion_percentage = random.randint(0, 100) if status != "not_started" else 0
            is_critical_path = random.random() < 0.3

            milestones.append({
                "id": milestone_id,
                "project_id": project["id"],
                "name": name,
                "due_date": due_date,
                "status": status,
                "completion_percentage": completion_percentage,
                "is_critical_path": is_critical_path,
                "health_status": health_map[status]
            })

            conn.execute("""
                INSERT INTO milestones (id, project_id, name, due_date, status,
                                      completion_percentage, is_critical_path, health_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, [milestone_id, project["id"], name,
                  due_date, status, completion_percentage,
                  is_critical_path, health_map[status]])

    print(f"🎯 Created {len(milestones)} milestones")
    return milestones

def generate_tasks(conn, milestones, users):
    """Generate task data with specific blocking scenarios"""
    tasks = []

    for milestone in milestones:
        num_tasks = random.randint(5, 20)

        for i in range(num_tasks):
            task_id = next_id('tasks')

            # Task attributes
            status = np.random.choice(
                ["todo", "in_progress", "blocked", "in_review", "completed"],
                p=[0.25, 0.35, 0.1, 0.15, 0.15]
            )

            priority = np.random.choice(
                ["critical", "high", "medium", "low"],
                p=[0.1, 0.3, 0.4, 0.2]
            )

            task_type = np.random.choice(
                ["feature", "bug", "improvement", "documentation", "meeting", "review"],
                p=[0.4, 0.2, 0.2, 0.1, 0.05, 0.05]
            )

            # Assign to user
            assigned_user = random.choice(users)
            assigner = random.choice([u for u in users if u["role"] in ["manager", "lead", "vp"]])

            # Dates
            start_date = milestone["due_date"] - timedelta(days=random.randint(7, 30))
            due_date = milestone["due_date"] - timedelta(days=random.randint(0, 7))

            # Hours
            estimated_hours = random.uniform(2, 40)
            actual_hours = estimated_hours * random.uniform(0.5, 1.5) if status in ["completed", "in_review"] else None

            # Title with keywords for blocking scenarios
            title_templates = [
                "Implement frontend for {}",
                "Build API endpoint for {}",
                "Create design mockup for {}",
                "Security audit for {}",
                "Database migration for {}",
                "Performance optimization for {}",
                "Deploy {} to production",
                "Compliance check for {}"
            ]

            title = random.choice(title_templates).format(fake.word())
            description = fake.paragraph()
            completed_at = datetime.now() if status == "completed" else None

            # Check for compliance requirements
            requires_compliance = "compliance" in title.lower() or "security" in title.lower() or "audit" in title.lower()

            # Check if blocking
            is_blocking = status == "blocked" or ("api" in title.lower() and random.random() < 0.3)

            tasks.append({
                "id": task_id,
                "milestone_id": milestone["id"],
                "parent_task_id": None,
                "title": title,
                "description": description,
                "status": status,
                "priority": priority,
                "assigned_to": assigned_user["id"],
                "assigned_by": assigner["id"],
                "estimated_hours": estimated_hours,
                "actual_hours": actual_hours,
                "start_date": start_date,
                "due_date": due_date,
                "completed_at": completed_at,
                "task_type": task_type,
                "requires_compliance_check": requires_compliance,
                "is_blocking": is_blocking
            })

            conn.execute("""
                INSERT INTO tasks (id, milestone_id, parent_task_id, title, description,
                                 status, priority, assigned_to, assigned_by,
                                 estimated_hours, actual_hours, start_date, due_date,
                                 completed_at, task_type, requires_compliance_check, is_blocking)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [task_id, milestone["id"], None, title, description,
                  status, priority, assigned_user["id"], assigner["id"],
                  estimated_hours, actual_hours, start_date, due_date,
                  completed_at, task_type, requires_compliance, is_blocking])

    print(f"📝 Created {len(tasks)} tasks")
    return tasks

def generate_task_dependencies(conn, tasks):
    """Generate task dependencies with specific blocking chains"""
    dependencies = []

    # Create API blocks Frontend pattern
    api_tasks = [t for t in tasks if "api" in t["title"].lower() or "backend" in t["title"].lower()]
    frontend_tasks = [t for t in tasks if "frontend" in t["title"].lower() or "ui" in t["title"].lower()]

    for frontend_task in random.sample(frontend_tasks, min(10, len(frontend_tasks))):
        if api_tasks:
            api_task = random.choice(api_tasks)
            dep_id = next_id('task_dependencies')

            dependencies.append({
                "id": dep_id,
                "task_id": frontend_task["id"],
                "depends_on_task_id": api_task["id"],
                "dependency_type": "blocks",
                "is_hard_dependency": True
            })

            try:
                conn.execute("""
                    INSERT INTO task_dependencies (id, task_id, depends_on_task_id, dependency_type, is_hard_dependency)
                    VALUES (?, ?, ?, ?, ?)
                """, [dep_id, frontend_task["id"], api_task["id"], "blocks", True])
            except:
                pass  # Skip if dependency already exists

    print(f"🔗 Created {len(dependencies)} task dependencies")
    return dependencies

def generate_task_comments(conn, tasks, users):
    """Generate task comments including blocker reasons"""

    comment_count = 0
    for task in tasks:
        # Blocked tasks must have blocker comments
        if task["status"] == "blocked":
            comment_id = next_id('task_comments')
            commenter = random.choice(users)

            blocker_templates = [
                "Waiting on API endpoint to be completed",
                "Need clarification from design team",
                "Blocked by external vendor response",
                "Technical issue: database connection failing",
                "Resource not available until next week",
                "Waiting for compliance approval",
                "Dependencies not yet resolved"
            ]

            conn.execute("""
                INSERT INTO task_comments (id, task_id, user_id, comment_text, is_blocker_reason)
                VALUES (?, ?, ?, ?, ?)
            """, [comment_id, task["id"], commenter["id"],
                  random.choice(blocker_templates), True])
            comment_count += 1

        # Add regular comments
        num_comments = random.randint(0, 5)
        for _ in range(num_comments):
            comment_id = next_id('task_comments')
            commenter = random.choice(users)

            conn.execute("""
                INSERT INTO task_comments (id, task_id, user_id, comment_text, is_blocker_reason)
                VALUES (?, ?, ?, ?, ?)
            """, [comment_id, task["id"], commenter["id"],
                  fake.paragraph(), False])
            comment_count += 1

    print(f"💬 Created {comment_count} task comments")

def generate_task_tags(conn, tasks):
    """Generate task tags based on keywords"""

    tag_rules = [
        {"keywords": ["user data", "authentication", "security", "audit", "compliance"], "tags": ["soc2", "security"]},
        {"keywords": ["api", "endpoint", "service"], "tags": ["api"]},
        {"keywords": ["ui", "interface", "design", "frontend"], "tags": ["ui"]},
        {"keywords": ["database", "migration", "schema"], "tags": ["database"]},
        {"keywords": ["performance", "optimize", "speed"], "tags": ["performance"]}
    ]

    tag_count = 0
    for task in tasks:
        title_lower = task["title"].lower()
        desc_lower = (task["description"] or "").lower()

        added_tags = set()

        for rule in tag_rules:
            if any(keyword in title_lower or keyword in desc_lower for keyword in rule["keywords"]):
                for tag in rule["tags"]:
                    if tag not in added_tags:
                        conn.execute("""
                            INSERT INTO task_tags (task_id, tag)
                            VALUES (?, ?)
                        """, [task["id"], tag])
                        added_tags.add(tag)
                        tag_count += 1

    print(f"🏷️ Created {tag_count} task tags")

def generate_work_logs(conn, tasks, users):
    """Generate historical work log data"""

    today = date.today()
    log_count = 0

    for task in tasks:
        if task["status"] in ["completed", "in_review", "in_progress"]:
            # Generate logs for past 90 days
            num_logs = random.randint(1, 20)

            for _ in range(num_logs):
                log_id = next_id('work_logs')
                log_date = today - timedelta(days=random.randint(1, 90))

                # Weekend vs weekday
                is_weekend = log_date.weekday() >= 5
                if is_weekend and random.random() > 0.15:
                    continue

                hours = random.uniform(0.5, 10)

                # Overrun for junior/intern
                user = next(u for u in users if u["id"] == task["assigned_to"])
                if user["role"] in ["junior", "intern"]:
                    hours *= 1.3
                elif user["role"] in ["senior", "lead"]:
                    hours *= 0.95

                conn.execute("""
                    INSERT INTO work_logs (id, task_id, user_id, hours_logged, log_date, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, [log_id, task["id"], task["assigned_to"], hours, log_date, fake.sentence()])
                log_count += 1

    print(f"📊 Created {log_count} work logs")

def generate_resource_requests(conn, users, projects):
    """Generate resource request data"""

    managers = [u for u in users if u["role"] in ["manager", "lead", "vp"]]

    for _ in range(30):
        request_id = next_id('resource_requests')
        requester = random.choice(managers)
        project = random.choice(projects)

        request_type = random.choice(["additional_developer", "overtime", "contractor", "tool", "budget"])
        urgency = random.choice(["immediate", "this_week", "next_sprint"])
        status = random.choice(["pending", "approved", "rejected", "fulfilled"])

        conn.execute("""
            INSERT INTO resource_requests (id, requested_by, project_id, request_type, urgency, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [request_id, requester["id"], project["id"], request_type, urgency, status])

    print("📋 Created 30 resource requests")

def generate_notifications(conn, users, tasks, projects, milestones):
    """Generate notification data"""

    notification_count = 0
    for user in users:
        num_notifications = random.randint(0, 15)

        for _ in range(num_notifications):
            notif_id = next_id('notifications')

            notif_type = np.random.choice(
                ["task_assigned", "blocker_created", "mention", "deadline_approaching", "status_request"],
                p=[0.3, 0.2, 0.2, 0.2, 0.1]
            )

            # Select entity
            entity_type = random.choice(["task", "project", "milestone"])
            if entity_type == "task" and tasks:
                entity = random.choice(tasks)
                entity_id = entity["id"]
                message = f"You have been assigned to: {entity['title']}"
            elif entity_type == "project" and projects:
                entity = random.choice(projects)
                entity_id = entity["id"]
                message = f"Project update: {entity['name']}"
            elif milestones:
                entity = random.choice(milestones)
                entity_id = entity["id"]
                message = f"Milestone approaching: {entity['name']}"
            else:
                continue

            is_read = random.random() > 0.4
            action_required = random.random() < 0.25

            conn.execute("""
                INSERT INTO notifications (id, user_id, type, entity_type, entity_id,
                                         message, is_read, action_required)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, [notif_id, user["id"], notif_type, entity_type, entity_id,
                  message, is_read, action_required])
            notification_count += 1

    print(f"🔔 Created {notification_count} notifications")

def validate_scenarios(conn):
    """Validate that demo scenarios exist"""

    print("\n🔍 Validating demo scenarios...")

    # Verify overloaded users
    result = conn.execute("""
        SELECT u.full_name, SUM(tm.allocation_percentage) as total_allocation
        FROM users u
        JOIN team_members tm ON u.id = tm.user_id
        GROUP BY u.id, u.full_name
        HAVING SUM(allocation_percentage) > 100
    """).fetchall()

    print(f"✅ Found {len(result)} overloaded users")

    # Verify blocking chains
    result = conn.execute("""
        SELECT COUNT(*) as blocking_chain_count
        FROM task_dependencies
        WHERE dependency_type = 'blocks'
    """).fetchone()

    print(f"✅ Found {result[0]} blocking dependencies")

    # Verify executive risk projects
    result = conn.execute("""
        SELECT name, risk_score, priority
        FROM projects
        WHERE risk_score >= 8 AND priority = 'critical'
    """).fetchall()

    print(f"✅ Found {len(result)} high-risk critical projects")

    # Verify SOC2 compliance tasks
    result = conn.execute("""
        SELECT COUNT(*) as compliance_tasks
        FROM tasks t
        JOIN task_tags tt ON t.id = tt.task_id
        WHERE tt.tag = 'soc2' AND t.status = 'blocked'
    """).fetchone()

    print(f"✅ Found {result[0]} blocked SOC2 compliance tasks")

def generate_manifest(conn):
    """Generate a manifest of the data created"""

    manifest = {
        "generated_at": datetime.now().isoformat(),
        "counts": {},
        "scenarios_validated": True
    }

    tables = ["organizations", "departments", "users", "teams", "projects",
              "milestones", "tasks", "task_dependencies", "notifications"]

    for table in tables:
        result = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
        manifest["counts"][table] = result[0]

    with open("generated/data_manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n📄 Generated data manifest")
    print(json.dumps(manifest["counts"], indent=2))

if __name__ == "__main__":
    generate_demo_data()