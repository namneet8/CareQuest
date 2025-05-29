// app/api/responses/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { saveUserResponse } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questionOptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const questionId = Number(body.questionId);
    
    console.log("🚀 Route received body:", body); // Debug log

    // Handle different types of responses
    let response: string | number;
    let optionId: number | undefined;

    if (body.optionId !== undefined && body.optionId !== null) {
      // Explicit optionId provided
      optionId = Number(body.optionId);
      response = body.response || body.optionId;
    } else if (body.response !== undefined && body.response !== null) {
      // Check if the response is actually an option ID by querying the database
      if (typeof body.response === 'number') {
        // Check if this number corresponds to an option for this question
        const option = await db.query.questionOptions.findFirst({
          where: and(
            eq(questionOptions.id, body.response),
            eq(questionOptions.questionId, questionId)
          )
        });
        
        if (option) {
          // This is an option ID disguised as a response
          optionId = Number(body.response);
          response = option.text; // Use the option text as response
          console.log("🔍 Detected option ID as response, converted to:", { optionId, response });
        } else {
          // This is a genuine numeric response (RATE/RANGE)
          response = body.response;
        }
      } else {
        // String response (FILL/TEXT)
        response = body.response;
      }
    } else {
      return NextResponse.json(
        { error: "Missing required response data" },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "Missing questionId" },
        { status: 400 }
      );
    }

    console.log("🚀 Calling saveUserResponse with:", { questionId, response, optionId }); // Debug log

    await saveUserResponse(questionId, response, optionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}