import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  console.log("🔔 POST /api/update-points hit");
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log("❌ No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ UserId:", userId);

    const body = await req.json();
    const { points } = body;

    console.log("📊 Points to add:", points);

    if (typeof points !== "number" || points < 0) {
      console.log("❌ Invalid points value");
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    // Get current user progress
    const currentProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    console.log("📈 Current progress:", currentProgress);

    if (!currentProgress) {
      console.log("❌ User progress not found, creating new record");
      
      // Create new user progress if it doesn't exist
      const newProgress = await db
        .insert(userProgress)
        .values({
          userId,
          points: points,
          spins: 5, // Default spins
        })
        .returning();

      console.log("✅ Created new progress:", newProgress[0]);
      
      return NextResponse.json({ 
        success: true, 
        newPoints: points,
        pointsAdded: points 
      });
    }

    // Update points
    const newPoints = currentProgress.points + points;
    
    console.log("🔄 Updating points from", currentProgress.points, "to", newPoints);
    
    await db
      .update(userProgress)
      .set({ 
        points: newPoints,
        updatedAt: new Date()
      })
      .where(eq(userProgress.userId, userId));

    console.log("✅ Points updated successfully");

    return NextResponse.json({ 
      success: true, 
      newPoints,
      pointsAdded: points 
    });

  } catch (error) {
    console.error("❌ Error updating points:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  console.log("🔔 GET /api/update-points hit - testing endpoint");
  return NextResponse.json({ 
    message: "Update points endpoint is working",
    timestamp: new Date().toISOString()
  });
}