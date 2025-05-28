import {Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

type Props = {
    activeLevel: {title: string; }; //Todo: Replace with DB types
    hearts: number;
    points: number;
    hasActiveSubscription:boolean;
};

export const UserProgress = ({activeLevel, points, hearts, hasActiveSubscription}: Props) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <Link href="/shop">
                <Button variant="ghost" className="text-orange-500">
                    <Image src="/points.svg" height={28} width={28} alt="Points" className="mr-2"/>
                    {points}
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="ghost" className="text-rose-500">
                    <Image src="/heart.svg" height={22} width={22} alt="Heart" className="mr-2"/>
                    {hearts}
                </Button>
            </Link>
        </div>
    );
}