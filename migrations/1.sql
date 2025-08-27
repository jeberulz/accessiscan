
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website_url TEXT NOT NULL,
  email TEXT,
  company_name TEXT,
  assessment_results TEXT,
  overall_score INTEGER,
  total_issues INTEGER,
  critical_issues INTEGER,
  high_impact_issues INTEGER,
  medium_impact_issues INTEGER,
  low_impact_issues INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  company_name TEXT,
  website_url TEXT,
  assessment_id INTEGER,
  contact_preferences TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
