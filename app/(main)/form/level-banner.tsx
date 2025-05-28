import { Button } from "@/components/ui/button";
import { NotebookPen, NotebookText } from "lucide-react";
import Link from "next/link";

type Props = {
    title: string;
    description: string;
};

export const LevelBanner = ({ title, description, }: Props) => {
    return(
        <div className="w-full rounded-xl bg-green-500 p-3 text-white flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold">
                    {title}
                </h3>
                <p className="text-lg">
                    {description}
                </p>
            </div>
            <Link href="/sublevel">
                <Button size="lg" variant="secondary" className="hidden xl:flex border-2 border-b-4 active:border-b-2">
                    <NotebookPen className="mr-1" />
                    Continue
                </Button>
            </Link>
        </div>
    )
}