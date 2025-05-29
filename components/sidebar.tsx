import { cn } from "@/lib/utils";
import  Image from "next/image";
import Link from "next/link"
import { SidebarItem} from "./sidebar-item";
import { ClerkLoaded,
    ClerkLoading,
    UserButton,
 } from "@clerk/nextjs";
import { Loader } from "lucide-react";

type Props = {
    className?: string;
};

export const Sidebar = ( { className }: Props) => {
    return(
        <div className={cn("flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
            className,
        )}>
            <Link href="/form">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image src="/logo.svg" height={40} width={40} alt="Logo"/>
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">CareQuest</h1>
                </div>
            </Link>
            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem label={"Form"} iconSrc={"/home.svg"} href={"/form"} />
                <SidebarItem label={"My Reports"} iconSrc={"/quests.svg"} href={"/reports"} />
                <SidebarItem label={"My Rewards"} iconSrc={"/leaderboard.svg"} href={"/rewards"} />
                <SidebarItem label={"About Us"} iconSrc={"/shop.svg"} href={"/shop"} />
            </div>
            <div className="p-4">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton />
                </ClerkLoaded>
            </div>
        </div>
    );
}