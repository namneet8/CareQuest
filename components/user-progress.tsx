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
  return (
    <div className="flex items-center justify-between gap-x-4 w-full">
      {/* Show current level name */}
      <span className="font-semibold text-lg">{activeLevel.title}</span>

      {/* Points */}
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

      {/* Spins */}
      <Link href="/shop">
        <Button variant="ghost" className="text-blue-500">
          <Image
            src="/spin.svg"
            height={28}
            width={28}
            alt="Spins"
            className="mr-2"
          />
          {spins}
        </Button>
      </Link>

      {/* Subscription CTA */}
      {!hasActiveSubscription && (
        <Link href="/subscribe">
          <Button variant="secondary">Subscribe</Button>
        </Link>
      )}
    </div>
  );
};
