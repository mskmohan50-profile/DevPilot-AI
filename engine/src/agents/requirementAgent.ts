import { generateJSON } from '../utils/gemini';

export interface RequirementAnalysis {
  summary: string;
  users: string[];
  features: string[];
  functionalReqs: string[];
  nonFunctionalReqs: string[];
  apiEndpoints: { method: string; path: string; description: string }[];
  databaseEntities: { name: string; fields: string[] }[];
  authRequirements: string[];
  edgeCases: string[];
}

function fallbackRequirements(idea: string): RequirementAnalysis {
  return {
      summary: idea || "Full-stack web application with authentication and database integration.",
      users: ["Standard User", "Admin User", "Manager"],
      features: [
        "User Registration & Auth with JWT",
        "Dashboard Overview & Analytics",
        "CRUD Resource Operations",
        "Real-time Notification Alerts",
        "Export and Reporting capabilities"
      ],
      functionalReqs: [
        "Users can register and authenticate via secure tokens",
        "Admins can manage platform roles and global settings",
        "Rest API endpoints expose CRUD functionalities for main entities",
        "Data is persisted in relational PostgreSQL database"
      ],
      nonFunctionalReqs: [
        "API response latency under 200ms",
        "Password hashing using Bcrypt",
        "CORS protection enabled for cross-origin security",
        "Modular full-stack codebase structure"
      ],
      apiEndpoints: [
        { method: "POST", path: "/api/v1/auth/login", description: "User login & JWT token issuance" },
        { method: "POST", path: "/api/v1/auth/register", description: "New user account registration" },
        { method: "GET", path: "/api/v1/items", description: "List application entries" },
        { method: "POST", path: "/api/v1/items", description: "Create new application entry" },
        { method: "DELETE", path: "/api/v1/items/{id}", description: "Delete specified application entry" }
      ],
      databaseEntities: [
        { name: "User", fields: ["id", "email", "hashed_password", "role", "created_at"] },
        { name: "Item", fields: ["id", "title", "description", "completed", "user_id", "created_at"] }
      ],
      authRequirements: ["JWT Bearer Token", "Role-Based Access Control (RBAC)", "Password Complexity Checks"],
      edgeCases: ["Duplicate email registration", "Token expiration handle", "Invalid payload validation error"]
  };
}

export async function analyzeRequirements(idea: string): Promise<RequirementAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackRequirements(idea);
  }

  const prompt = `
  You are an expert Software Architect AI Agent.
  Analyze the prompt and output JSON matching:
  {
    "summary": "overview",
    "users": ["Role 1"],
    "features": ["Feature 1"],
    "functionalReqs": ["Req 1"],
    "nonFunctionalReqs": ["Req 1"],
    "apiEndpoints": [{"method": "GET", "path": "/api/v1/items", "description": "desc"}],
    "databaseEntities": [{"name": "User", "fields": ["id", "email"]}],
    "authRequirements": ["JWT"],
    "edgeCases": ["Edge case 1"]
  }
  Idea: "${idea}"
  `;
  try {
    return await generateJSON<RequirementAnalysis>(prompt);
  } catch (err) {
    console.error('analyzeRequirements LLM error, falling back to static requirements:', err);
    return fallbackRequirements(idea);
  }
}
