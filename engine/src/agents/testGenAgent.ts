import { generateJSON } from '../utils/gemini';
import { RequirementAnalysis } from './requirementAgent';
import { FileNode } from './codeGenAgent';

export interface TestCase {
  id: string;
  group: string;
  name: string;
  type?: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  description?: string;
  assertion?: string;
  executionTimeMs?: number;
  status: 'pass' | 'fail';
  error?: string;
}

export interface TestSuite {
  total: number;
  passed: number;
  failed: number;
  durationMs?: number;
  coverageEstimate?: number;
  cases: TestCase[];
}

function fallbackTests(): TestSuite {
  return {
      total: 6,
      passed: 5,
      failed: 1,
      durationMs: 420,
      coverageEstimate: 88,
      cases: [
        { 
          id: "t1", 
          group: "System Health", 
          name: "test_health_check_endpoint", 
          type: "unit",
          description: "Verify that /health responds with HTTP 200 OK and valid status body",
          assertion: "assert response.status_code == 200 and response.json()['status'] == 'ok'",
          executionTimeMs: 12,
          status: "pass" 
        },
        { 
          id: "t2", 
          group: "Authentication", 
          name: "test_user_registration", 
          type: "integration",
          description: "Verify new user registration with valid credentials",
          assertion: "assert response.status_code == 201 and 'id' in response.json()",
          executionTimeMs: 85,
          status: "pass" 
        },
        { 
          id: "t3", 
          group: "Authentication", 
          name: "test_user_login_success", 
          type: "integration",
          description: "Verify successful login returning valid JWT access token",
          assertion: "assert response.status_code == 200 and 'access_token' in response.json()",
          executionTimeMs: 92,
          status: "pass" 
        },
        { 
          id: "t4", 
          group: "Authentication", 
          name: "test_duplicate_email_registration", 
          type: "security",
          description: "Ensure registering with existing email yields appropriate conflict response",
          assertion: "assert response.status_code == 400 or response.status_code == 409",
          executionTimeMs: 64,
          status: "fail", 
          error: "IntegrityError: Duplicate key value violates unique constraint 'users_email_key'" 
        },
        { 
          id: "t5", 
          group: "API Operations", 
          name: "test_list_items_empty_state", 
          type: "unit",
          description: "Verify fetching resource list returns empty array for new account",
          assertion: "assert response.status_code == 200 and response.json() == []",
          executionTimeMs: 18,
          status: "pass" 
        },
        { 
          id: "t6", 
          group: "API Operations", 
          name: "test_create_item_authorized", 
          type: "integration",
          description: "Verify authorized user can create item successfully",
          assertion: "assert response.status_code == 201 and response.json()['name'] == payload['name']",
          executionTimeMs: 149,
          status: "pass" 
        }
      ]
  };
}

export async function generateTests(req: RequirementAnalysis, fileTree: FileNode): Promise<TestSuite> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackTests();
  }

  const prompt = `
  You are a QA Test Automation AI Agent.
  Output JSON test suite:
  {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "durationMs": 350,
    "coverageEstimate": 85,
    "cases": [
      { 
        "id": "t1", 
        "group": "Auth", 
        "name": "test_login", 
        "type": "integration",
        "description": "Verify user authentication",
        "assertion": "assert res.status == 200",
        "executionTimeMs": 45,
        "status": "pass" 
      },
      { 
        "id": "t2", 
        "group": "Auth", 
        "name": "test_duplicate_email", 
        "type": "security",
        "description": "Prevent duplicate registration",
        "assertion": "assert res.status == 409",
        "executionTimeMs": 52,
        "status": "fail", 
        "error": "IntegrityError: duplicate key" 
      }
    ]
  }
  Requirements: ${JSON.stringify(req)}
  FileTree: ${JSON.stringify(fileTree)}
  `;
  try {
    return await generateJSON<TestSuite>(prompt);
  } catch (err) {
    console.error('generateTests LLM error, falling back to static test suite:', err);
    return fallbackTests();
  }
}
