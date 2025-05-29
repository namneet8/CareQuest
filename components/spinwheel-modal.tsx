"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Wheel } from "react-custom-roulette";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onReward: (reward: string) => void;
};

const prizes = [
  { option: "10% Discount" },
  { option: "50% Discount" },
  { option: "$50 Gift Card" },
  { option: "$10 Gift Card" },
    { option: "Free Doctor Consultation" },
  { option: "Free Dental Appointment" },
  { option: "Try Again" },
];

export const SpinWheelModal = ({ open, onClose, onReward }: Props) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * prizes.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted || !open) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-4 relative max-w-md mx-4">
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold text-xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-2">Spin the Wheel!</h2>

        {/* Wheel component */}
        <div className="mb-4">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={prizes}
            backgroundColors={["#FFCF40", "#40AFFF", "#FF6F61", "#7DCE82"]}
            textColors={["#000"]}
            fontSize={14}
            radiusLineWidth={2}
            outerBorderColor="#ddd"
            outerBorderWidth={5}
            spinDuration={0.8}
            onStopSpinning={() => {
              setMustSpin(false);
              onReward(prizes[prizeNumber].option);
            }}
          />
        </div>

        {/* Spin button */}
        {!mustSpin && (
          <Button 
            onClick={handleSpinClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 text-lg"
          >
            Spin the Wheel!
          </Button>
        )}

        {mustSpin && (
          <p className="text-gray-600 animate-pulse">Spinning...</p>
        )}
      </div>
    </div>
  );

  // Use createPortal to render the modal outside the component tree
  return createPortal(modalContent, document.body);
};