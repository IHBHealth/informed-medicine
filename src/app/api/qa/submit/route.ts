import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qaSubmissions } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, question, details, category } = body;

    if (!name || !question) {
      return NextResponse.json(
        { error: "Name and question are required" },
        { status: 400 }
      );
    }

    if (name.length > 100 || question.length > 500 || (details && details.length > 2000)) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    const validCategories = [
      "heart-health", "mental-health", "nutrition", "fitness", "sleep",
      "diabetes", "cancer", "womens-health", "mens-health", "pediatrics",
      "medications", "general",
    ];

    await db.insert(qaSubmissions).values({
      name: name.trim(),
      email: email?.trim() || null,
      question: question.trim(),
      details: details?.trim() || null,
      category: validCategories.includes(category) ? category : "general",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("QA submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit question" },
      { status: 500 }
    );
  }
}
