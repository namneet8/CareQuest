"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SpinWheelModal } from "./spinwheel-modal";
import { RewardModal } from "./reward-modal";

interface Props {
  activeLevel: { title: string };
  spins: number;
  points: number;
  hasActiveSubscription: boolean;
}

export const UserProgress = ({
  activeLevel,
  points,
  spins,
  hasActiveSubscription,
}: Props) => {
  const pointsToNextSpin = 100 - (points % 100);
  const progressPercentage = ((points % 100) / 100) * 100;
  const isSpinAvailable = spins > 0;

  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<string>("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const motivationalMessages = [
    "Keep going, you're almost at the next spin!",
    "You're doing awesome, keep earning those points!",
    "Spin that wheel, champion!",
    "Every point brings you closer to great rewards!",
    "You're on fire! Let's get that next level!",
  ];

  // Cycle through messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % motivationalMessages.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenSpinModal = () => {
    if (isSpinAvailable) {
      setIsSpinModalOpen(true);
    }
  };

  const handleReward = async (reward: string) => {
    setIsSpinModalOpen(false);
    setCurrentReward(reward);
    
    if (reward.toLowerCase().includes("try again")) {
      alert("Better luck next time!");
      return;
    }

    setIsRewardModalOpen(true);
    
    try {
      const response = await fetch("/api/use-spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward }),
      });
      
      if (!response.ok) {
        console.error("Failed to process reward");
      }
    } catch (error) {
      console.error("Error using spin:", error);
    }
  };

  const handleCloseSpinModal = () => {
    setIsSpinModalOpen(false);
  };

  const handleCloseRewardModal = () => {
    setIsRewardModalOpen(false);
    setCurrentReward("");
    window.location.reload();
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-center justify-between p-6 bg-white rounded-xl shadow-md h-[60vh]">
        {/* Level Title */}
        <div className="text-2xl font-bold">Unlock Spin Wheel,</div>
        <div className="text-2xl font-bold mb-4">Unlock lucky deals</div>

        {/* Points Section */}
        <div className="w-full flex flex-col items-center">
          <Link href="/shop">
            <Button variant="ghost" className="text-orange-500">
              <Image src="/points.svg" height={32} width={32} alt="Points" className="mr-2" />
              <span className="text-xl font-semibold">{points}</span>
            </Button>
          </Link>
          <div className="w-full mt-2">
            <span className="text-sm text-gray-500">
              {pointsToNextSpin === 100 ? "Spin available!" : `Next spin in ${pointsToNextSpin} pts`}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Spins Section with Mascot and Message Bubble */}
        <div className="flex flex-col items-center mt-1 mb-5 ">
          <button
            disabled={!isSpinAvailable}
            onClick={handleOpenSpinModal}
            className={`relative transition-all duration-300 ${
              isSpinAvailable 
                ? 'cursor-pointer hover:scale-105 transform' 
                : 'cursor-not-allowed opacity-50'
            }`}
            title={isSpinAvailable ? "Click to spin!" : "No spins available"}
          >
            <Image
              src="/spin-wheel.gif"
              height={80}
              width={80}
              alt="Spin Wheel"
              className="rounded-full shadow-lg"
            />
            {spins > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold animate-pulse">
                {spins}
              </div>
            )}
          </button>
          <span className="text-lg font-medium mt-2 text-center">
            {spins === 0 ? "No spins available" : `${spins} spin${spins > 1 ? "s" : ""} available`}
          </span>
          {!isSpinAvailable && (
            <p className="text-sm text-gray-500 mt-1 text-center">
              Complete more sublevels to earn spins!
            </p>
          )}
          {/* Mascot and Message Bubble */}
          <div className="flex items-end gap-4 mt-10">
            <Image
              src="/teddyHI.gif"
              height={100}
              width={100}
              alt="Mascot"
              className="object-contain"
            />
            <div className="relative max-w-[280px]">
              <div className="bg-white text-gray-800 p-5 rounded-2xl shadow-xl border border-gray-200 text-base font-medium leading-relaxed transition-opacity duration-500">
                {motivationalMessages[currentMessageIndex]}
              </div>
              {/* Speech bubble tail */}
              <div className="absolute -left-4 top-1/2 w-0 h-0 border-t-12 border-t-transparent border-r-12 border-r-white border-b-12 border-b-transparent shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* SpinWheelModal Component */}
      <SpinWheelModal
        open={isSpinModalOpen}
        onClose={handleCloseSpinModal}
        onReward={handleReward}
      />

      {/* RewardModal Component */}
      <RewardModal
        open={isRewardModalOpen}
        onClose={handleCloseRewardModal}
        reward={currentReward}
      />
    </>
  );
};