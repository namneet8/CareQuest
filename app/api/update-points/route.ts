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
      
      // Calculate spins for new user (1 spin per 100 points)
      const newSpins = Math.floor(points / 100);
      
      // Create new user progress if it doesn't exist
      const newProgress = await db
        .insert(userProgress)
        .values({
          userId,
          points: points,
          spins: newSpins,
        })
        .returning();

      console.log("✅ Created new progress:", newProgress[0]);
      
      return NextResponse.json({ 
        success: true, 
        newPoints: points,
        newSpins: newSpins,
        pointsAdded: points,
        spinsEarned: newSpins
      });
    }

    // Calculate new points and spins
    const oldPoints = currentProgress.points;
    const newPoints = oldPoints + points;
    
    // Calculate spins based on crossing 100-point thresholds
    const oldSpinThreshold = Math.floor(oldPoints / 100);
    const newSpinThreshold = Math.floor(newPoints / 100);
    const spinsEarned = newSpinThreshold - oldSpinThreshold;
    const newTotalSpins = currentProgress.spins + spinsEarned;
    
    console.log("🎯 Spin calculation:");
    console.log("   Old points:", oldPoints, "-> New points:", newPoints);
    console.log("   Old spin threshold:", oldSpinThreshold, "-> New spin threshold:", newSpinThreshold);
    console.log("   Spins earned:", spinsEarned);
    console.log("   Old total spins:", currentProgress.spins, "-> New total spins:", newTotalSpins);
    
    // Update points and spins
    await db
      .update(userProgress)
      .set({ 
        points: newPoints,
        spins: newTotalSpins,
        updatedAt: new Date()
      })
      .where(eq(userProgress.userId, userId));

    console.log("✅ Points and spins updated successfully");

    return NextResponse.json({ 
      success: true, 
      newPoints,
      newSpins: newTotalSpins,
      pointsAdded: points,
      spinsEarned
    });

  } catch (error) {
    console.error("❌ Error updating points:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
