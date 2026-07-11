import type { SurveyInput, SurveyResult } from "@/lib/schemas/survey";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".panelly-submissions.json");

let neon: ((...args: unknown[]) => any) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  neon = require("@neondatabase/serverless").neon;
} catch {
  neon = null;
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl && neon ? neon(databaseUrl) : null;
}

async function loadFallbackStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Record<string, SurveyResult>;
  } catch {
    return {};
  }
}

async function saveFallbackStore(store: Record<string, SurveyResult>) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function persistSubmission(
  input: SurveyInput,
  result: Omit<SurveyResult, "submissionId" | "createdAt">,
): Promise<{ submissionId: string }> {
  const submissionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const payload: SurveyResult = {
    submissionId,
    createdAt,
    ...result,
  };

  const sql = getSql();
  if (sql) {
    try {
      await sql`CREATE TABLE IF NOT EXISTS submissions (
        submission_id TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        payload JSONB NOT NULL
      )`;

      await sql`INSERT INTO submissions (submission_id, created_at, payload)
        VALUES (${submissionId}, ${createdAt}, ${JSON.stringify(payload)}::jsonb)`;
      
      console.log("✅ Submission saved to database:", submissionId);
    } catch (dbError) {
      console.error("❌ Database save failed, falling back to file:", dbError);
      // Fall back to file store on database error
      const store = await loadFallbackStore();
      store[submissionId] = payload;
      await saveFallbackStore(store);
      console.log("✅ Submission saved to file store:", submissionId);
    }
  } else {
    const store = await loadFallbackStore();
    store[submissionId] = payload;
    await saveFallbackStore(store);
    console.log("✅ Submission saved to file store:", submissionId);
  }

  return { submissionId };
}

export async function loadSubmission(submissionId: string): Promise<SurveyResult | null> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT payload FROM submissions WHERE submission_id = ${submissionId} LIMIT 1`;
      if (rows?.length) {
        console.log("✅ Submission loaded from database:", submissionId);
        return rows[0].payload as SurveyResult;
      }
    } catch (dbError) {
      console.error("❌ Database load failed:", dbError);
    }
    // Fall through to file store if database is empty or error
  }

  const store = await loadFallbackStore();
  const result = store[submissionId] ?? null;
  if (result) {
    console.log("✅ Submission loaded from file store:", submissionId);
  } else {
    console.log("❌ Submission not found:", submissionId);
  }
  return result;
}
