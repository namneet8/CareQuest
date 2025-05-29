import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define possible rewards with weights for controlled randomness
const rewards = [
  { option: "10% Discount", weight: 20 },
  { option: "50% Discount", weight: 5 },
  { option: "$50 Gift Card", weight: 5 },
  { option: "$10 Gift Card", weight: 30 },
  { option: "Free Online Doctor Consultation", weight: 10 },
  { option: "Free Dental Appointment", weight: 10 },
  { option: "Try Again", weight: 20 },
];

// Function to select a reward based on weights
function selectReward(): string {
  const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
  let random = Math.random() * totalWeight;
  for (const reward of rewards) {
    random -= reward.weight;
    if (random <= 0) {
      return reward.option;
    }
  }
  return rewards[rewards.length - 1].option; // Fallback
}

export async function POST(req: NextRequest) {
  console.log("🎰 POST /api/use-spin hit");

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("❌ No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ UserId:", userId);

    // Get current user progress
    const currentProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    console.log("📈 Current progress:", currentProgress);

    if (!currentProgress) {
      console.log("❌ User progress not found");
      return NextResponse.json({ error: "User progress not found" }, { status: 404 });
    }

    if (currentProgress.spins <= 0 || currentProgress.spins > 5) {
      console.log("❌ Invalid spins count");
      return NextResponse.json({ error: "No spins available or spin limit exceeded" }, { status: 400 });
    }

    // Select reward on the server
    const reward = selectReward();

    console.log("🎁 Reward selected:", reward);

    // Calculate new values based on reward
    let pointsToAdd = 0;
    let newSpins = currentProgress.spins - 1; // Always deduct one spin

    // Handle different reward types
    switch (reward) {
      case "Extra 50 Points":
        pointsToAdd = 50;
        break;
      case "10% Discount":
      case "50% Discount":
      case "$50 Gift Card":
      case "$10 Gift Card":
      case "Free Doctor Consultation":
      case "Free Dental Appointment":
        // These don't add points, just record the reward
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
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId));

    console.log("✅ Spin used successfully");
    console.log("🎁 Reward processed:", reward);
    console.log("📊 New points:", newPoints);
    console.log("🎰 Remaining spins:", newSpins);

    return NextResponse.json({
      success: true,
      reward,
      newPoints,
      newSpins,
      pointsAdded: pointsToAdd,
    });

  } catch (error) {
    console.error("❌ Error using spin:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}