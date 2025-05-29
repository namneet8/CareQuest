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
  level: number; // 👈 NEW PROP
};

export const SublevelButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  level, // 👈 Receive level
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  // 👇 Alternate curve direction based on level number
  const isOddLevel = level % 2 !== 0;
  const baseRightPosition =
    Math.sin(cycleIndex * (2 * Math.PI / cycleLength)) * 90;
  const rightPosition = isOddLevel ? -baseRightPosition : baseRightPosition;
  const marginTop =
    30 + Math.cos(cycleIndex * (2 * Math.PI / cycleLength)) * 10;

  const isCompleted = !current && !locked;
  const Icon = isCompleted ? Check : index === totalCount ? Crown : Star;
  const href = isCompleted ? `/sublevel/${id}` : "/sublevel";

  // Clamp and round the percentage
  const raw = Number.isNaN(percentage) ? 0 : percentage;
  const clamped = Math.min(Math.max(Math.round(raw), 0), 100);
  const pct = isCompleted ? 100 : clamped;

  const pathColor = "#4ade80";
  const trailColor = pct === 100 ? pathColor : "#e5e7eb";

  return (
    <div>
      <Link
        href={href}
        aria-disabled={locked}
        style={{ pointerEvents: locked ? "none" : undefined }}
      >
        <div
          className="relative"
          style={{
            right: `${rightPosition}px`,
            marginTop: `${marginTop}px`,
          }}
        >
          {current ? (
            <div className="h-[75px] w-[75px] relative">
              <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
                Start
                <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
              </div>

              <CircularProgressbarWithChildren
                value={pct}
                strokeWidth={8}
                styles={{
                  path: { stroke: pathColor, strokeLinecap: "butt" },
                  trail: { stroke: trailColor, strokeLinecap: "butt" },
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

