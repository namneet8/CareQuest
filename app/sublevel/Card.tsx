import { questions } from "@/db/schema";
import { cn } from "@/lib/utils";

type Props = {
    id: number;
    //imageSrc: string | null;
    //audioSrc: string | null;
    text: string;
    shortcut: string;
    selected?:boolean;
    onClick: () => void;
    disabled?: boolean;
    //status?: "correct" | "wrong" | "none",
    type: typeof questions.$inferSelect["type"];
}

export const Card = ({id, text, shortcut, selected, onClick, disabled, type} : Props) => {
    return(
        <div
            onClick={() => {}}
            className={cn(
                "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2", 
                selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
                disabled && "pointer-events-none hover:bg-white",

            )}
        >
            {text}
        </div>
    )
}