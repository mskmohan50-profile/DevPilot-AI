import { generateJSON } from '../utils/gemini';
import { RequirementAnalysis } from './requirementAgent';

export interface ArchitecturePlan {
  stack: { layer: string; technology: string; reason: string }[];
  systemArchitecture: string;
  componentStructure: { name: string; responsibility: string }[];
  apiStructure: string;
  databaseDesign: string;
  authFlow: string;
  dataFlow: string[];
  features?: string[];
  recommendedFeatures?: { feature: string; description: string; priority: 'High' | 'Medium' | 'Low'; rationale: string }[];
}

export async function planArchitecture(req: RequirementAnalysis, techStack: string = 'react-fastapi-postgres'): Promise<ArchitecturePlan> {
  const defaultFeatures = req?.features?.length ? req.features : [
    "User Authentication & Authorization",
    "RESTful API Endpoint Layer",
    "Database Persistence & Schema Management",
    "Real-time Event Notification Gateway",
    "Automated Testing & Code Quality Assurance"
  ];

  const defaultRecommendedFeatures = [
    {
      feature: "API Rate Limiting & Throttling",
      description: "Protect backend services against DDoS and abuse using token bucket algorithm.",
      priority: "High" as const,
      rationale: "Ensures service stability, availability, and security under high concurrent traffic."
    },
    {
      feature: "Observability & OpenTelemetry Tracing",
      description: "Structured JSON logging, Prometheus metrics, and distributed request tracing.",
      priority: "High" as const,
      rationale: "Accelerates root-cause analysis and provides system health visualization."
    },
    {
      feature: "Background Async Task Queue",
      description: "Offload long-running operations like report generation and email delivery.",
      priority: "Medium" as const,
      rationale: "Keeps HTTP request/response cycles fast and responsive."
    },
    {
      feature: "Automated CI/CD Pipeline & Health Checks",
      description: "GitHub Actions workflow for linting, testing, and automated container deployment.",
      priority: "Medium" as const,
      rationale: "Ensures continuous delivery with strict quality gates before production deployments."
    },
    {
      feature: "Role-Based Access Control (RBAC)",
      description: "Fine-grained permission system distinguishing Admin, Manager, and Standard User roles.",
      priority: "High" as const,
      rationale: "Prevents unauthorized access to sensitive routes and data mutations."
    },
    {
      feature: "Pagination, Filtering & Sorting",
      description: "Cursor or offset-based pagination with query-param filtering on list endpoints.",
      priority: "Medium" as const,
      rationale: "Keeps API responses fast and usable as the dataset grows."
    },
    {
      feature: "Input Validation & Sanitization Layer",
      description: "Schema-based request validation (e.g. Zod, Pydantic, Marshmallow) on every mutating endpoint.",
      priority: "High" as const,
      rationale: "Blocks malformed or malicious payloads before they reach business logic."
    },
    {
      feature: "Centralized Error Handling & Logging",
      description: "Uniform error response shape plus structured server-side logging for every request.",
      priority: "Medium" as const,
      rationale: "Makes failures easier to diagnose and keeps client-facing errors consistent."
    },
    {
      feature: "Dark Mode & Theming Support",
      description: "System-aware light/dark theme toggle backed by CSS variables or a design-token system.",
      priority: "Low" as const,
      rationale: "Improves accessibility and user comfort across lighting conditions."
    },
    {
      feature: "Containerized Local Dev Environment",
      description: "docker-compose setup that spins up the full stack (frontend, backend, database) with one command.",
      priority: "Medium" as const,
      rationale: "Removes onboarding friction and keeps dev/prod environments consistent."
    }
  ];

  const getStackByChoice = (choice: string) => {
    switch (choice) {
      case 'nextjs-tailwind-postgres':
        return [
          { layer: "Framework", technology: "Next.js 14 (App Router)", reason: "Full-stack React framework with SSR, Server Actions, and built-in routing" },
          { layer: "Styling", technology: "Tailwind CSS", reason: "Utility-first CSS framework for rapid UI styling" },
          { layer: "Database", technology: "PostgreSQL + Prisma ORM", reason: "Type-safe database ORM and migrations" },
          { layer: "Auth", technology: "NextAuth.js / Jose", reason: "Secure session and JWT auth management" }
        ];
      case 'nodejs-express-mongodb':
        return [
          { layer: "Backend", technology: "Node.js + Express.js", reason: "Asynchronous non-blocking JavaScript server runtime" },
          { layer: "Database", technology: "MongoDB + Mongoose ODM", reason: "Document-oriented NoSQL database for flexible JSON schemas" },
          { layer: "Frontend", technology: "React + Vite", reason: "Modern component library with instant HMR build" },
          { layer: "Auth", technology: "JSON Web Tokens (JWT) + bcryptjs", reason: "Stateless bearer token authentication" }
        ];
      case 'vue-python-sqlite':
        return [
          { layer: "Frontend", technology: "Vue.js 3 + Pinia", reason: "Progressive reactive frontend framework with central state" },
          { layer: "Backend", technology: "Python Flask", reason: "Lightweight WSGI web application framework" },
          { layer: "Database", technology: "SQLite + Flask-SQLAlchemy", reason: "Zero-config embedded relational database" },
          { layer: "Auth", technology: "Flask-JWT-Extended", reason: "Simple JWT authentication for Flask" }
        ];
      default:
        return [
          { layer: "Frontend", technology: "React + TypeScript + Vite", reason: "Interactive component model with full type safety" },
          { layer: "Backend", technology: "Python FastAPI", reason: "Asynchronous high-performance REST API generation" },
          { layer: "Database", technology: "PostgreSQL", reason: "ACID-compliant relational data persistence" },
          { layer: "ORM", technology: "SQLAlchemy 2.0", reason: "Robust database abstraction and migration management" }
        ];
    }
  };

  const stack = getStackByChoice(techStack);

  const getStackSpecificFeatures = (choice: string) => {
    switch (choice) {
      case 'nextjs-tailwind-postgres':
        return [
          {
            feature: "Server-Side Rendering & Server Actions",
            description: "Leverage Next.js App Router server components and server actions for zero-client-JS mutations.",
            priority: "High" as const,
            rationale: "Improves initial load performance and simplifies data mutation without extra API boilerplate."
          },
          {
            feature: "Prisma Migrations & Studio",
            description: "Version-controlled schema migrations with a visual data browser via Prisma Studio.",
            priority: "Medium" as const,
            rationale: "Keeps the PostgreSQL schema reproducible across environments and easy to inspect."
          }
        ];
      case 'nodejs-express-mongodb':
        return [
          {
            feature: "Mongoose Schema Validation & Indexing",
            description: "Enforce document shape with Mongoose schemas and add compound indexes for query hot paths.",
            priority: "High" as const,
            rationale: "Keeps a schemaless database consistent and query performance predictable."
          },
          {
            feature: "JWT Refresh Token Rotation",
            description: "Short-lived access tokens paired with rotating refresh tokens stored securely.",
            priority: "Medium" as const,
            rationale: "Reduces the blast radius of a leaked access token."
          }
        ];
      case 'vue-python-sqlite':
        return [
          {
            feature: "Pinia Centralized State Store",
            description: "Reactive, typed state management shared across Vue components.",
            priority: "Medium" as const,
            rationale: "Keeps UI state predictable as the app grows beyond a few components."
          },
          {
            feature: "SQLite-to-Postgres Migration Path",
            description: "Flask-SQLAlchemy models written against an abstraction that migrates cleanly to Postgres later.",
            priority: "Low" as const,
            rationale: "Lets the project start zero-config and scale to a production-grade database when needed."
          }
        ];
      default:
        return [
          {
            feature: "Async SQLAlchemy 2.0 Sessions",
            description: "Non-blocking database access using FastAPI's async endpoint support.",
            priority: "High" as const,
            rationale: "Maximizes throughput for I/O-bound API workloads."
          },
          {
            feature: "Auto-Generated OpenAPI Docs",
            description: "FastAPI's built-in Swagger UI and ReDoc served at /docs and /redoc.",
            priority: "Low" as const,
            rationale: "Gives frontend and third-party consumers an always-up-to-date API reference."
          }
        ];
    }
  };

  if (!process.env.GEMINI_API_KEY) {
    return {
      stack,
      systemArchitecture: `Decoupled Architecture configured for target stack: ${techStack}`,
      componentStructure: [
        { name: "server", responsibility: "Backend API gateway and controller routes" },
        { name: "client/frontend", responsibility: "Frontend user interface components and state" },
        { name: "database", responsibility: "Persistence layer and data storage schemas" }
      ],
      apiStructure: "RESTful JSON API with OpenAPI v3 specs, standard HTTP status codes, and JSON error response structures.",
      databaseDesign: "Database schema with index-backed primary keys and timestamp audit columns.",
      authFlow: "Client POSTs credentials -> Server validates hash & returns JWT Bearer token -> Client attaches Auth header on subsequent requests.",
      dataFlow: [
        "1. User submits action in Frontend Interface",
        "2. Client sends HTTP request to Backend API with auth token",
        "3. Backend validates request payload and executes database query",
        "4. Database completes transaction and returns data",
        "5. Backend serializes response JSON back to Client"
      ],
      features: defaultFeatures,
      recommendedFeatures: [...defaultRecommendedFeatures, ...getStackSpecificFeatures(techStack)]
    };
  }

  const prompt = `
  You are a Principal Software Architect AI Agent.
  Target Selected Tech Stack: ${techStack}
  Requirements: ${JSON.stringify(req)}

  Output architecture JSON matching:
  {
    "stack": ${JSON.stringify(stack)},
    "systemArchitecture": "3-tier or full-stack architectural details tailored specifically for ${techStack}",
    "componentStructure": [{"name": "src/", "responsibility": "role"}],
    "apiStructure": "REST specs",
    "databaseDesign": "Schema details",
    "authFlow": "JWT or session lifecycle",
    "dataFlow": ["Flow step 1"],
    "features": ["Feature 1", "Feature 2"],
    "recommendedFeatures": [
      {
        "feature": "Feature Name",
        "description": "Short description of the feature",
        "priority": "High",
        "rationale": "Why this feature is recommended for this architecture"
      }
    ]
  }
  `;

  try {
    const result = await generateJSON<ArchitecturePlan>(prompt);
    return {
      ...result,
      stack: result.stack && result.stack.length ? result.stack : stack,
      features: result.features && result.features.length ? result.features : defaultFeatures,
      recommendedFeatures:
        result.recommendedFeatures && result.recommendedFeatures.length
          ? result.recommendedFeatures
          : [...defaultRecommendedFeatures, ...getStackSpecificFeatures(techStack)]
    };
  } catch (err) {
    console.error('planArchitecture LLM error, falling back to static plan:', err);
    return {
      stack,
      systemArchitecture: `Decoupled Architecture configured for target stack: ${techStack}`,
      componentStructure: [
        { name: "server", responsibility: "Backend API gateway and controller routes" },
        { name: "client/frontend", responsibility: "Frontend user interface components and state" },
        { name: "database", responsibility: "Persistence layer and data storage schemas" }
      ],
      apiStructure: "RESTful JSON API with OpenAPI v3 specs, standard HTTP status codes, and JSON error response structures.",
      databaseDesign: "Database schema with index-backed primary keys and timestamp audit columns.",
      authFlow: "Client POSTs credentials -> Server validates hash & returns JWT Bearer token -> Client attaches Auth header on subsequent requests.",
      dataFlow: [
        "1. User submits action in Frontend Interface",
        "2. Client sends HTTP request to Backend API with auth token",
        "3. Backend validates request payload and executes database query",
        "4. Database completes transaction and returns data",
        "5. Backend serializes response JSON back to Client"
      ],
      features: defaultFeatures,
      recommendedFeatures: [...defaultRecommendedFeatures, ...getStackSpecificFeatures(techStack)]
    };
  }
}
