# AI Agent Instructions for Demo Data Generation

## Context
You are tasked with generating realistic demo data for a generative UI product demonstration. The demo showcases a planning and task management system where an AI dynamically generates different interfaces based on user roles, contexts, and queries. The data needs to support various scenarios from executive dashboards to developer task lists, with complex dependencies and realistic organizational structures.

## Your Task
Generate a Python script that creates data in DuckDB format following the provided schema and metadata configuration. The data must be rich enough to demonstrate:
- Role-based UI generation (CEO, Developer, PM, etc.)
- Action-oriented interfaces (not just analytics)
- Complex dependency chains and blockers
- Resource allocation and overload scenarios
- Compliance and risk management workflows
- Historical trends and patterns

## Instructions

### 1. Setup
Create a Python script that:
```python
import duckdb
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import uuid
from faker import Faker

# Initialize
fake = Faker()
conn = duckdb.connect('planning.duckdb')
```

### 2. Schema Implementation
First, execute all CREATE TABLE statements from the provided SQL schema in DuckDB. Ensure proper order considering foreign key constraints.

### 3. Data Generation Requirements

Follow these specific rules when generating data:

#### Organizations & Departments
- Create exactly 1 organization: "TechVision Corp"
- Create 7 departments with the specified distribution weights
- Ensure each department has appropriate team structures

#### Users (150 total)
- **Critical**: Create specific overloaded users at indices [30, 45, 67, 88, 92]
- Distribute roles hierarchically (1 CEO, 7 VPs - one per department, etc.)
- Assign specializations based on department type
- Use timezone distribution: PST(40%), EST(30%), CST(15%), GMT(10%), IST(5%)
- Generate realistic names and emails using Faker

#### Projects (25 total)
- **Must include** these specific projects for demo scenarios:
  - "Mobile App 2.0" (Phoenix) - critical, high risk
  - "Enterprise API Platform" (Atlas) - showing improvement trends
  - "SOC2 Compliance Initiative" (Shield) - compliance-focused
  - "Customer Portal" (Gateway) - multi-team dependencies
- Follow status distribution: active(60%), planning(15%), on_hold(10%), completed(10%), cancelled(5%)
- Ensure risk scores align with project priority and status

#### Tasks & Dependencies
- **Create specific blocking chains**:
  - API blocks Frontend tasks
  - Design blocks Implementation tasks
  - Compliance blocks Release tasks
- Generate 10-15% overdue tasks for intervention demos
- Create at least 2 dependency chains of length 5+ crossing different teams
- Tag tasks with ["soc2", "gdpr", "api", "ui", "database", "security", "performance"] based on keywords

#### Special Demo Scenarios
Ensure these specific scenarios exist:
1. **Executive View**: At least 3 critical projects with risk scores 8-10
2. **Resource Manager View**: 5+ users allocated 125-150% capacity
3. **Developer View**: Personal tasks with mix of statuses, some blocked
4. **PM View**: Cross-team dependencies visible in "Customer Portal" project
5. **Compliance View**: 3+ SOC2-tagged tasks in blocked status
6. **Trends View**: "Phoenix" project showing velocity decline over past 30 days

#### Work Logs & Historical Data
- Generate 90 days of historical work logs
- Higher log frequency on weekdays (85%) vs weekends (15%)
- Junior/Intern roles should show 30% overrun on estimates
- Senior/Lead roles should show 5% under estimates

#### Notifications
- 40% unread, 25% requiring action
- Recent notifications weighted toward last week
- Mix of types: task_assigned(30%), blocker_created(20%), mention(20%), deadline_approaching(20%), status_request(10%)

### 4. Data Integrity Rules

1. **Temporal Consistency**:
   - Task dates must fall within project dates
   - Completed tasks must have work logs
   - Blocked tasks must have blocker comments

2. **Dependency Logic**:
   - No circular dependencies
   - Child tasks can't complete before parent tasks
   - Cross-project dependencies should be rare but meaningful

3. **Resource Reality**:
   - No user can have >200% allocation
   - Interns max 20 hours/week availability
   - VPs and above have more meetings, less task work

4. **Status Coherence**:
   - Completed projects can't have incomplete critical path milestones
   - Blocked tasks must have at least one blocker comment
   - At-risk milestones should have high-priority tasks

### 5. Output Format

Save all data to DuckDB with these table names:
- organizations
- departments
- users
- teams
- team_members
- projects
- milestones
- tasks
- task_dependencies
- task_comments
- task_tags
- work_logs
- resource_requests
- notifications

### 6. Validation Queries

Include these validation queries at the end to ensure demo readiness:
```sql
-- Verify overloaded users exist
SELECT full_name, SUM(allocation_percentage) as total_allocation
FROM users u
JOIN team_members tm ON u.id = tm.user_id
GROUP BY u.id, u.full_name
HAVING SUM(allocation_percentage) > 100;

-- Verify blocking chains exist
SELECT COUNT(*) as blocking_chain_count
FROM task_dependencies
WHERE dependency_type = 'blocks';

-- Verify executive risk projects
SELECT name, risk_score, priority
FROM projects
WHERE risk_score >= 8 AND priority = 'critical';
```

### 7. Final Output

The script should:
1. Print summary statistics of generated data
2. Run validation queries and display results
3. Save the DuckDB file as 'planning_demo.duckdb'
4. Generate a data_manifest.json with counts and key scenario confirmations

## Example Code Structure

```python
def generate_demo_data():
    # Initialize connections and helpers

    # Generate in order:
    # 1. Organizations & Departments
    # 2. Users & Teams
    # 3. Projects & Milestones
    # 4. Tasks (with special scenarios)
    # 5. Dependencies (with specific patterns)
    # 6. Historical data (work logs, comments)
    # 7. Current state (notifications, requests)

    # Validate all demo scenarios exist

    # Save to DuckDB

    # Generate manifest

if __name__ == "__main__":
    generate_demo_data()
```

## Important Notes

- **Combinatorial Variety**: Use different combinations of attributes to create realistic variety. For example, combine user roles, departments, and task types in meaningful ways.
- **Demo Flow**: The data should support a natural story flow from executive overview → problem identification → drilling down → taking action
- **Performance**: Create indexes on frequently queried columns (assigned_to, status, due_date, etc.)
- **Repeatability**: Use seed values for random generation to ensure consistent demo data

Generate this data with attention to creating a compelling demonstration that showcases the power of generative UI to create role-specific, action-oriented interfaces from the same underlying data.




here is detailed info:

I'll create a comprehensive SQL database structure with detailed data generation metadata for your planning system demo. This will ensure you have rich, varied data to showcase all aspects of your generative UI.

## SQL Database Structure

```sql
-- Core Tables

CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) -- 'engineering', 'design', 'sales', 'operations', 'finance', 'hr', 'compliance'
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    department_id UUID REFERENCES departments(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50), -- 'ceo', 'vp', 'manager', 'lead', 'senior', 'junior', 'intern'
    specialization VARCHAR(50), -- 'frontend', 'backend', 'fullstack', 'ui_ux', 'data', 'devops', 'product', 'business'
    availability_hours_per_week INTEGER DEFAULT 40,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id UUID PRIMARY KEY,
    department_id UUID REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    lead_user_id UUID REFERENCES users(id)
);

CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES users(id),
    allocation_percentage INTEGER DEFAULT 100,
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code_name VARCHAR(50),
    status VARCHAR(50), -- 'planning', 'active', 'on_hold', 'completed', 'cancelled'
    priority VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    budget_allocated DECIMAL(12, 2),
    budget_consumed DECIMAL(12, 2),
    risk_score INTEGER, -- 1-10
    compliance_required BOOLEAN DEFAULT FALSE,
    client_facing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE milestones (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    due_date DATE,
    status VARCHAR(50), -- 'not_started', 'in_progress', 'completed', 'delayed', 'at_risk'
    completion_percentage INTEGER DEFAULT 0,
    is_critical_path BOOLEAN DEFAULT FALSE,
    health_status VARCHAR(20) -- 'green', 'yellow', 'red'
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    milestone_id UUID REFERENCES milestones(id),
    parent_task_id UUID REFERENCES tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50), -- 'todo', 'in_progress', 'blocked', 'in_review', 'completed'
    priority VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP,
    task_type VARCHAR(50), -- 'feature', 'bug', 'improvement', 'documentation', 'meeting', 'review'
    requires_compliance_check BOOLEAN DEFAULT FALSE,
    is_blocking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    depends_on_task_id UUID REFERENCES tasks(id),
    dependency_type VARCHAR(50), -- 'blocks', 'requires', 'related_to'
    is_hard_dependency BOOLEAN DEFAULT TRUE,
    UNIQUE(task_id, depends_on_task_id)
);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    user_id UUID REFERENCES users(id),
    comment_text TEXT,
    is_blocker_reason BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tags (
    task_id UUID REFERENCES tasks(id),
    tag VARCHAR(50), -- 'soc2', 'gdpr', 'api', 'ui', 'database', 'security', 'performance'
    PRIMARY KEY (task_id, tag)
);

CREATE TABLE work_logs (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    user_id UUID REFERENCES users(id),
    hours_logged DECIMAL(4, 2),
    log_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_requests (
    id UUID PRIMARY KEY,
    requested_by UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    request_type VARCHAR(50), -- 'additional_developer', 'overtime', 'contractor', 'tool', 'budget'
    urgency VARCHAR(20), -- 'immediate', 'this_week', 'next_sprint'
    status VARCHAR(50), -- 'pending', 'approved', 'rejected', 'fulfilled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50), -- 'task_assigned', 'blocker_created', 'mention', 'deadline_approaching', 'status_request'
    entity_type VARCHAR(50), -- 'task', 'project', 'milestone'
    entity_id UUID,
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
```

## Data Generation Metadata

```python
# Data Generation Configuration

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
        "vp": {"count": 7, "availability": 45},  # One per department
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
    # Ensure overloaded scenarios for demo
    "overload_patterns": [
        {"user_indices": [30, 45, 67], "overload_factor": 1.5},  # 150% allocated
        {"user_indices": [88, 92], "overload_factor": 1.3}  # 130% allocated
    ]
}

TEAMS_CONFIG = {
    "teams_per_department": {
        "engineering": 8,  # Frontend, Backend, Mobile, DevOps, Data, API, Security, Platform
        "design": 3,       # Product Design, Brand, Research
        "product": 3,      # B2B, B2C, Platform
        "sales": 2,        # Enterprise, SMB
        "operations": 2,   # Infrastructure, Process
        "finance": 1,
        "compliance": 1
    }
}

PROJECTS_CONFIG = {
    "count": 25,
    "templates": [
        # High-priority projects for executive view
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
        # Projects with dependency chains
        {
            "name": "Customer Portal", "code_name": "Gateway",
            "priority": "high", "status": "active",
            "risk_score": 5, "client_facing": True
        },
        {
            "name": "Data Migration Phase 2", "code_name": "Exodus",
            "priority": "medium", "status": "active",
            "risk_score": 7, "client_facing": False
        },
        # Projects in different states
        {
            "name": "AI Integration", "code_name": "Skynet",
            "priority": "medium", "status": "planning",
            "risk_score": 4
        },
        {
            "name": "Legacy System Sunset", "code_name": "Sunset",
            "priority": "high", "status": "on_hold",
            "risk_score": 8
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

MILESTONES_CONFIG = {
    "per_project_range": [3, 8],
    "critical_path_probability": 0.3,
    "status_distribution": {
        "not_started": 0.2,
        "in_progress": 0.5,
        "completed": 0.2,
        "delayed": 0.08,
        "at_risk": 0.02
    },
    "health_by_status": {
        "completed": {"green": 1.0, "yellow": 0, "red": 0},
        "in_progress": {"green": 0.6, "yellow": 0.3, "red": 0.1},
        "not_started": {"green": 0.8, "yellow": 0.2, "red": 0},
        "delayed": {"green": 0, "yellow": 0.3, "red": 0.7},
        "at_risk": {"green": 0, "yellow": 0.2, "red": 0.8}
    }
}

TASKS_CONFIG = {
    "per_milestone_range": [5, 20],
    "subtask_probability": 0.3,
    "max_subtask_depth": 3,

    "status_distribution": {
        "todo": 0.25,
        "in_progress": 0.35,
        "blocked": 0.1,  # Critical for demo
        "in_review": 0.15,
        "completed": 0.15
    },

    "priority_distribution": {
        "critical": 0.1,
        "high": 0.3,
        "medium": 0.4,
        "low": 0.2
    },

    "type_distribution": {
        "feature": 0.4,
        "bug": 0.2,
        "improvement": 0.2,
        "documentation": 0.1,
        "meeting": 0.05,
        "review": 0.05
    },

    "blocking_scenarios": [
        # Create specific blocking chains for demo
        {
            "pattern": "api_dependency",
            "blocked_task_contains": ["frontend", "mobile", "ui"],
            "blocking_task_contains": ["api", "backend", "service"],
            "probability": 0.8
        },
        {
            "pattern": "design_dependency",
            "blocked_task_contains": ["implement", "build"],
            "blocking_task_contains": ["design", "mockup", "wireframe"],
            "probability": 0.7
        },
        {
            "pattern": "compliance_block",
            "blocked_task_contains": ["release", "deploy", "launch"],
            "blocking_task_contains": ["compliance", "security", "audit"],
            "probability": 0.9
        }
    ],

    "overdue_patterns": [
        # Create tasks that are overdue for intervention demos
        {"percentage": 0.15, "days_overdue_range": [1, 14]},
        {"percentage": 0.05, "days_overdue_range": [15, 30]}
    ],

    "compliance_tag_rules": [
        {"keywords": ["user data", "authentication", "security"], "tags": ["soc2", "security"]},
        {"keywords": ["api", "endpoint", "service"], "tags": ["api"]},
        {"keywords": ["ui", "interface", "design"], "tags": ["ui"]},
        {"keywords": ["database", "migration", "schema"], "tags": ["database"]},
        {"keywords": ["performance", "optimize", "speed"], "tags": ["performance"]}
    ]
}

DEPENDENCIES_CONFIG = {
    "avg_dependencies_per_task": 1.5,
    "cross_milestone_probability": 0.3,
    "cross_project_probability": 0.1,

    # Create realistic dependency chains
    "dependency_patterns": [
        {
            "name": "waterfall_chain",
            "probability": 0.3,
            "chain_length": [3, 6]
        },
        {
            "name": "diamond_pattern",  # Multiple tasks depend on one, then converge
            "probability": 0.2,
            "split_factor": [2, 4],
            "converge_to_single": True
        },
        {
            "name": "parallel_merge",  # Multiple parallel tracks merge
            "probability": 0.2,
            "parallel_tracks": [2, 3]
        }
    ]
}

WORK_LOG_CONFIG = {
    "historical_days": 90,
    "log_probability_by_day": {
        "weekday": 0.85,
        "weekend": 0.15
    },
    "hours_distribution": {
        "normal": {"mean": 6, "std": 2, "min": 0.5, "max": 10},
        "crunch": {"mean": 9, "std": 2, "min": 4, "max": 14}  # For critical tasks
    },
    "accuracy_patterns": [
        {"user_role": ["junior", "intern"], "overrun_factor": 1.3},
        {"user_role": ["senior", "lead"], "overrun_factor": 0.95}
    ]
}

COMMENTS_CONFIG = {
    "avg_comments_per_task": 2.5,
    "blocker_comment_triggers": {
        "status": ["blocked"],
        "required": True,
        "templates": [
            "Waiting on {dependency} to be completed",
            "Need clarification from {team} team",
            "Blocked by external vendor response",
            "Technical issue: {specific_issue}",
            "Resource not available until {date}"
        ]
    },
    "comment_frequency_by_status": {
        "blocked": 3.5,
        "in_review": 2.8,
        "in_progress": 2.0,
        "todo": 0.5,
        "completed": 1.5
    }
}

NOTIFICATIONS_CONFIG = {
    "unread_percentage": 0.4,
    "action_required_percentage": 0.25,
    "type_distribution": {
        "task_assigned": 0.3,
        "blocker_created": 0.2,
        "mention": 0.2,
        "deadline_approaching": 0.2,
        "status_request": 0.1
    },
    "age_distribution": {
        "last_hour": 0.1,
        "today": 0.3,
        "this_week": 0.4,
        "older": 0.2
    }
}

SPECIAL_SCENARIOS = {
    # Ensure specific scenarios exist for demo
    "executive_risks": {
        "ensure_projects": [
            {"priority": "critical", "risk_score": [8, 10], "count": 3}
        ]
    },
    "resource_conflicts": {
        "ensure_users": [
            {"allocated_hours": [50, 60], "count": 5}  # Overallocated
        ]
    },
    "dependency_chains": {
        "ensure_chains": [
            {"length": 5, "all_different_teams": True, "count": 2}
        ]
    },
    "compliance_issues": {
        "ensure_tasks": [
            {"tags": ["soc2"], "status": "blocked", "count": 3}
        ]
    },
    "trending_data": {
        "velocity_decline_project": "Phoenix",  # Ensure this project shows declining velocity
        "improved_project": "Atlas"  # Ensure this shows improvement
    }
}

# Date generation helpers
DATE_CONFIG = {
    "project_start_range": [-180, -30],  # Days from today
    "project_duration_range": [30, 365],
    "milestone_spacing": [14, 45],  # Days between milestones
    "task_duration_range": [1, 21],
    "current_date_offset": 0  # Adjust to simulate different "today" dates
}
```

This configuration will generate:
- **150 users** across 7 departments with realistic role distributions
- **25 projects** with varying priorities and health statuses
- **Complex dependency chains** for demonstrating blocker analysis
- **Overallocated resources** for resource management demos
- **Compliance-tagged tasks** for regulatory workflows
- **Historical data** for trend analysis
- **Various task statuses** including strategic "blocked" tasks

The combinatorial variety ensures you can demonstrate all the scenarios in your demo while maintaining realistic data relationships.
