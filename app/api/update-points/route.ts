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

      // Calculate spins for new user based on points
      const spinsToAdd = Math.floor(points / 100);

      // Create new user progress if it doesn't exist
      const newProgress = await db
        .insert(userProgress)
        .values({
          userId,
          points: points,
          spins: spinsToAdd, // Award spins based on points
          updatedAt: new Date(),
        })
        .returning();

      console.log("✅ Created new progress:", newProgress[0]);

      return NextResponse.json({
        success: true,
        newPoints: points,
        newSpins: spinsToAdd,
        pointsAdded: points,
        spinsAdded: spinsToAdd,
      });
    }

    // Calculate new points and spins
    const newPoints = currentProgress.points + points;
    // Calculate spins to add based on points crossing multiples of 100
    const spinsToAdd = Math.floor(newPoints / 100) - Math.floor(currentProgress.points / 100);
    const newSpins = currentProgress.spins + spinsToAdd;

    console.log("🔄 Updating points from", currentProgress.points, "to", newPoints);
    console.log("🎰 Updating spins from", currentProgress.spins, "to", newSpins);

    // Update user progress
    await db
      .update(userProgress)
      .set({
        points: newPoints,
        spins: newSpins,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId));

    console.log("✅ Points and spins updated successfully");

    return NextResponse.json({
      success: true,
      newPoints,
      newSpins,
      pointsAdded: points,
      spinsAdded: spinsToAdd,
    });

  } catch (error) {
    console.error("❌ Error updating points:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
