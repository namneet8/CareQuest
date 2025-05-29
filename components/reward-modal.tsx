"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  reward: string;
}

export const RewardModal = ({ open, onClose, reward }: RewardModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Get appropriate image and display text based on reward
  const getRewardDetails = (reward: string) => {
    const lowerReward = reward.toLowerCase();
    
    if (lowerReward.includes("10% discount") || lowerReward.includes("10%")) {
      return {
        image: "/discount-10.png", // You'll need to add this image to your public folder
        title: "10% Discount",
        description: "Save 10% on your next purchase!"
      };
    } else if (lowerReward.includes("20% discount") || lowerReward.includes("20%")) {
      return {
        image: "/discount-20.png", // You'll need to add this image
        title: "20% Discount",
        description: "Save 20% on your next purchase!"
      };
    } else if (lowerReward.includes("25% discount") || lowerReward.includes("25%")) {
      return {
        image: "/discount-25.png", // You'll need to add this image
        title: "25% Discount",
        description: "Save 25% on your next purchase!"
      };
    } else if (lowerReward.includes("50% discount") || lowerReward.includes("50%")) {
      return {
        image: "/discount-50.png", // You'll need to add this image
        title: "50% Discount",
        description: "Save 50% on your next purchase!"
      };
    } else if (lowerReward.includes("free shipping")) {
      return {
        image: "/free-shipping.png", // You'll need to add this image
        title: "Free Shipping",
        description: "Get free shipping on your next order!"
      };
    } else if (lowerReward.includes("free item") || lowerReward.includes("bonus")) {
      return {
        image: "/free-item.png", // You'll need to add this image
        title: "Free Item",
        description: "Get a free bonus item with your purchase!"
      };
    } else if (lowerReward.includes("points") || lowerReward.includes("100") || lowerReward.includes("200")) {
      return {
        image: "/bonus-points.png", // You'll need to add this image
        title: "Bonus Points",
        description: `You've earned ${reward}!`
      };
    } else {
      return {
        image: "/reward-generic.png", // Generic reward image
        title: "Congratulations!",
        description: `You've won: ${reward}`
      };
    }
  };

  if (!mounted || !open) return null;

  const rewardDetails = getRewardDetails(reward);

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="mb-4">
            <div className="text-6xl">🎉</div>
          </div>

          {/* Reward Image */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Image
                src={rewardDetails.image}
                width={120}
                height={120}
                alt={rewardDetails.title}
                className="rounded-xl shadow-lg"
                onError={(e) => {
                  // Fallback to a generic reward icon if image fails to load
                  e.currentTarget.src = "/reward-generic.png";
                }}
              />
              {/* Sparkle effect */}
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-150">🌟</div>
            </div>
          </div>

          {/* Reward Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {rewardDetails.title}
          </h2>

          {/* Reward Description */}
          <p className="text-gray-600 mb-6 text-lg">
            {rewardDetails.description}
          </p>

          {/* Redemption Info */}
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              <span className="font-semibold">Good news!</span> You can redeem your reward anytime from the rewards page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/rewards" className="block">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg">
                View My Rewards
              </Button>
            </Link>
            
            <Button 
              variant="primary" 
              onClick={onClose}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3"
            >
              Continue Playing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};