import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

type Props = {
  activeLevel: { title: string };
  spins: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const UserProgress = ({
  activeLevel,
  points,
  spins,
  hasActiveSubscription,
}: Props) => {
  // Calculate progress toward next spin (1 spin per 100 points)
  const pointsToNextSpin = 100 - (points % 100);
  const progressPercentage = ((points % 100) / 100) * 100;
  const isAtMaxProgress = pointsToNextSpin === 100; // User just earned a spin

  return (
    <div className="flex items-center justify-between gap-x-4 w-full">
      {/* Show current level name */}
      <span className="font-semibold text-lg">{activeLevel.title}</span>

      {/* Points with progress indicator */}
      <div className="flex flex-col items-center">
        <Link href="/shop">
          <Button variant="ghost" className="text-orange-500">
            <Image
              src="/points.svg"
              height={28}
              width={28}
              alt="Points"
              className="mr-2"
            />
            {points}
          </Button>
        </Link>
        
        {/* Progress bar to next spin */}
        <div className="w-full mt-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Next spin in {isAtMaxProgress ? 0 : pointsToNextSpin} pts</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${isAtMaxProgress ? 100 : progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spins with enhanced styling */}
      <div className="flex flex-col items-center">
        <Link href="/shop">
          <Button variant="ghost" className="text-blue-500 relative">
            <Image
              src="/heart.svg"
              height={28}
              width={28}
              alt="Spins"
              className="mr-2"
            />
            {spins}
            {spins > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </Button>
        </Link>
        <span className="text-xs text-gray-500 mt-1">
          {spins === 0 ? "No spins" : `${spins} spin${spins > 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
};
