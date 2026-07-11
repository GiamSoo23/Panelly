import { neon, neonConfig } from "@neondatabase/serverless";

import { getUserId } from "@/lib/auth/getUserId";
import {
  SurveyInputSchema,
  SurveyResultSchema,
  type SurveyInput,
  type SurveyResult,
} from "@/lib/schemas/survey";

export type SubmissionRecord = {
  submissionId: string;
  userId: string;
  input: SurveyInput;
  result: Omit<SurveyResult, "submissionId" | "createdAt">;
  createdAt: string;
};

export type HistoryEntry = {
  submissionId: string;
  userId: string | null;
  createdAt: string;
  input: SurveyInput;
  result: SurveyResult;
};

let sqlClient: ReturnType<typeof neon> | undefined;

function createSubmissionId(prefix = "sub") {
  const randomPart =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${randomPart}`;
}

export function getSqlClient() {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  if (!sqlClient) {
    neonConfig.fetchConnectionCache = true;
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export function prepareSubmissionRecord(
  input: SurveyInput,
  result: Omit<SurveyResult, "submissionId" | "createdAt">,
  userId?: string,
): SubmissionRecord {
  const resolvedUserId = userId ?? "anonymous";

  return {
    submissionId: createSubmissionId("submission"),
    userId: resolvedUserId,
    input,
    result,
    createdAt: new Date().toISOString(),
  };
}

export async function ensureDatabaseSchema() {
  const sql = getSqlClient();
  if (!sql) {
    return false;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      input_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS results (
      submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
      result_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  return true;
}

export async function saveSubmissionToDatabase(record: SubmissionRecord) {
  const sql = getSqlClient();
  if (!sql) {
    return undefined;
  }

  await ensureDatabaseSchema();

  await sql`
    INSERT INTO users (id)
    VALUES (${record.userId})
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO submissions (id, user_id, input_json, created_at)
    VALUES (
      ${record.submissionId},
      ${record.userId},
      ${JSON.stringify(record.input)}::jsonb,
      ${record.createdAt}
    )
  `;

  await sql`
    INSERT INTO results (submission_id, result_json, created_at)
    VALUES (
      ${record.submissionId},
      ${JSON.stringify({ ...record.result, submissionId: record.submissionId, createdAt: record.createdAt })}::jsonb,
      ${record.createdAt}
    )
  `;

  return record.submissionId;
}

export async function getUserSubmissions(userId?: string): Promise<HistoryEntry[]> {
  const sql = getSqlClient();
  if (!sql) {
    return [];
  }

  const rows = await sql`
    SELECT
      s.id AS submission_id,
      s.user_id,
      s.created_at,
      s.input_json,
      r.result_json
    FROM submissions s
    LEFT JOIN results r ON r.submission_id = s.id
    WHERE (${userId} IS NULL OR s.user_id = ${userId})
    ORDER BY s.created_at DESC
    LIMIT 20
  `;

  return (rows as Array<Record<string, unknown>>).map((row) => {
    const result = SurveyResultSchema.parse({
      ...(row.result_json as Record<string, unknown>),
      submissionId: row.submission_id,
      createdAt: row.created_at,
    });

    return {
      submissionId: String(row.submission_id),
      userId: row.user_id ? String(row.user_id) : null,
      createdAt: String(row.created_at),
      input: SurveyInputSchema.parse(row.input_json),
      result,
    } satisfies HistoryEntry;
  });
}

export async function getSubmissionById(submissionId: string): Promise<HistoryEntry | null> {
  const sql = getSqlClient();
  if (!sql) {
    return null;
  }

  const rows = await sql`
    SELECT
      s.id AS submission_id,
      s.user_id,
      s.created_at,
      s.input_json,
      r.result_json
    FROM submissions s
    LEFT JOIN results r ON r.submission_id = s.id
    WHERE s.id = ${submissionId}
    LIMIT 1
  `;

  const [row] = rows as Array<Record<string, unknown>>;
  if (!row) {
    return null;
  }

  const result = SurveyResultSchema.parse({
    ...(row.result_json as Record<string, unknown>),
    submissionId: row.submission_id,
    createdAt: row.created_at,
  });

  return {
    submissionId: String(row.submission_id),
    userId: row.user_id ? String(row.user_id) : null,
    createdAt: String(row.created_at),
    input: SurveyInputSchema.parse(row.input_json),
    result,
  } satisfies HistoryEntry;
}

export async function getDemoUserId() {
  const authUserId = await getUserId();
  return authUserId ?? process.env.NEXT_PUBLIC_DEMO_USER_ID ?? undefined;
}
