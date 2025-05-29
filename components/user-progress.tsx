"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SpinWheelModal } from "./spinwheel-modal";

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
  const isSpinAvailable = spins > 0; // Simplified condition - user can spin if they have spins

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (isSpinAvailable) {
      setIsModalOpen(true);
    }
  };

  const handleReward = async (reward: string) => {
    setIsModalOpen(false);
    
    // TODO: Implement backend logic to deduct spin and save reward
    try {
      // Example API call to deduct spin
      const response = await fetch("/api/use-spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward }),
      });
      
      if (response.ok) {
        alert(`Congrats! You've won: ${reward}`);
        // Refresh the page to update spin count
        window.location.reload();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error using spin:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-center justify-center p-6 bg-white rounded-xl shadow-md h-[60vh]">
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

        {/* Spins Section */}
        <div className="flex flex-col items-center mt-4">
          <button
            disabled={!isSpinAvailable}
            onClick={handleOpenModal}
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
        </div>
      </div>

      {/* SpinWheelModal Component - Now rendered with portal */}
      <SpinWheelModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onReward={handleReward}
      />
    </>
  );
};