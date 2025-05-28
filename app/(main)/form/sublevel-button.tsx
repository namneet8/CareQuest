"use client";

import { Check, Crown, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const SublevelButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  // Smooth wave-like indentation
  const waveAmplitude = 90; // Max horizontal pixels
  const waveFrequency = (2 * Math.PI) / cycleLength;

  const rightPosition = Math.sin(cycleIndex * waveFrequency) * waveAmplitude;
  const marginTop = 30 + Math.cos(cycleIndex * waveFrequency) * 10;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : Star;
  const href = isCompleted ? `/sublevel/${id}` : "/sublevel";

  return (
    <div>
      <Link
        href={href}
        aria-disabled={locked}
        style={{ pointerEvents: locked ? "none" : "auto" }}
      >
        <div
          className="relative"
          style={{
            right: `${rightPosition}px`,
            marginTop: `${marginTop}px`,
          }}
        >
          {current ? (
            // START button with progress bar
            <div className="h-[75px] w-[75px] relative">
              <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
                Start
                <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
              </div>
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: { stroke: "#4ade80" },
                  trail: { stroke: "#e5e7eb" },
                }}
              >
                <Button
                  size="rounded"
                  variant={locked ? "locked" : "secondary"}
                  className="h-[50px] w-[50px] border-b-8"
                >
                  <Icon
                    className={cn(
                      "h-12 w-12",
                      locked
                        ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                        : "fill-primary-foreground text-primary-foreground",
                      isCompleted && "fill-none stroke-[4]"
                    )}
                  />
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <Button
              size="rounded"
              variant={locked ? "locked" : "secondary"}
              className="h-[50px] w-[50px] border-b-8"
            >
              <Icon
                className={cn(
                  "h-12 w-12",
                  locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                  isCompleted && "fill-none stroke-[4]"
                )}
              />
            </Button>
          )}
        </div>
      </Link>
    </div>
  );
};
