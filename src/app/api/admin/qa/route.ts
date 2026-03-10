import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qaSubmissions } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = db.select().from(qaSubmissions).orderBy(desc(qaSubmissions.createdAt));

  let submissions;
  if (status && status !== "all") {
    submissions = await db
      .select()
      .from(qaSubmissions)
      .where(eq(qaSubmissions.status, status))
      .orderBy(desc(qaSubmissions.createdAt));
  } else {
    submissions = await query;
  }

  return NextResponse.json({ submissions });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, answer, answeredBy } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (answer !== undefined) updates.answer = answer;
  if (answeredBy !== undefined) updates.answeredBy = answeredBy;
  if (status === "answered") updates.answeredAt = new Date();

  await db.update(qaSubmissions).set(updates).where(eq(qaSubmissions.id, id));

  return NextResponse.json({ success: true });
}
