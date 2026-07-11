import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

let neon: ((...args: unknown[]) => any) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  neon = require("@neondatabase/serverless").neon;
} catch {
  neon = null;
}

const DATA_FILE = path.join(process.cwd(), ".panelly-submissions.json");

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl && neon ? neon(databaseUrl) : null;
}

async function loadFallbackStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

async function saveFallbackStore(store: Record<string, unknown>) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function GET(request: NextRequest) {
  const submissionId = request.nextUrl.searchParams.get("id");
  if (!submissionId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const sql = getSql();
  if (sql) {
    const rows = await sql`SELECT payload FROM submissions WHERE submission_id = ${submissionId} LIMIT 1`;
    if (rows?.length) {
      return NextResponse.json({ submission: rows[0].payload });
    }
    // Fall through to file store if database is empty
  }

  const store = await loadFallbackStore();
  const submission = store[submissionId] as any;
  
  // Handle both nested (payload) and direct storage formats
  if (submission?.payload) {
    return NextResponse.json({ submission: submission.payload });
  }
  if (submission) {
    return NextResponse.json({ submission });
  }

  return NextResponse.json({ error: "Submission not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = body?.result;
    const input = body?.input;

    if (!payload || !input) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const submissionId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const record = {
      submissionId,
      createdAt,
      payload: {
        ...payload,
        zip: payload.zip || input.zip,
      },
    };

    const sql = getSql();

    if (sql) {
      await sql`CREATE TABLE IF NOT EXISTS submissions (
        submission_id TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        payload JSONB NOT NULL
      )`;

      await sql`INSERT INTO submissions (submission_id, created_at, payload)
        VALUES (${submissionId}, ${createdAt}, ${JSON.stringify(record.payload)}::jsonb)`;

      return NextResponse.json({ submissionId, createdAt });
    }

    const store = await loadFallbackStore();
    store[submissionId] = record;
    await saveFallbackStore(store as Record<string, unknown>);

    return NextResponse.json({ submissionId, createdAt });
  } catch (error) {
    console.error("submission POST failed", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
