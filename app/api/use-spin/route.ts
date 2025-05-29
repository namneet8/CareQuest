import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  console.log("🎰 POST /api/use-spin hit");
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log("❌ No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ UserId:", userId);

    const body = await req.json();
    const { reward } = body;

    console.log("🎁 Reward won:", reward);

    // Get current user progress
    const currentProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    console.log("📈 Current progress:", currentProgress);

    if (!currentProgress) {
      console.log("❌ User progress not found");
      return NextResponse.json({ error: "User progress not found" }, { status: 404 });
    }

    if (currentProgress.spins <= 0) {
      console.log("❌ No spins available");
      return NextResponse.json({ error: "No spins available" }, { status: 400 });
    }

    // Calculate new values based on reward
    let pointsToAdd = 0;
    let newSpins = currentProgress.spins - 1; // Always deduct one spin

    // Handle different reward types
    switch (reward) {
      case "Extra 50 Points":
        pointsToAdd = 50;
        break;
      case "10% Discount":
      case "$10 Gift Card":
        // These don't add points, just record the reward
        // You might want to save these to a separate rewards table
        break;
      case "Try Again":
        // Don't deduct spin for "Try Again"
        newSpins = currentProgress.spins;
        break;
      default:
        console.log("⚠️ Unknown reward type:", reward);
    }

    const newPoints = currentProgress.points + pointsToAdd;

    // Update user progress
    await db
      .update(userProgress)
      .set({ 
        points: newPoints,
        spins: newSpins,
        updatedAt: new Date()
      })
      .where(eq(userProgress.userId, userId));

    console.log("✅ Spin used successfully");
    console.log("🎁 Reward processed:", reward);
    console.log("📊 New points:", newPoints);
    console.log("🎰 Remaining spins:", newSpins);

    // TODO: Save reward to a separate rewards/achievements table if needed
    // This could track user's reward history

    return NextResponse.json({ 
      success: true, 
      reward,
      newPoints,
      newSpins,
      pointsAdded: pointsToAdd
    });

  } catch (error) {
    console.error("❌ Error using spin:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}