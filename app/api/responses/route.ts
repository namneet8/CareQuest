import { NextRequest, NextResponse } from "next/server";
import { saveUserResponse } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, response, optionId } = body;

    if (!questionId || response === undefined || response === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await saveUserResponse(questionId, response, optionId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // You can add logic here to fetch user responses if needed
    return NextResponse.json({ message: "GET endpoint for responses" });
  } catch (error) {
    console.error("Error in GET /api/responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}