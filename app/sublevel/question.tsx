import { questionOptions, questions } from "@/db/schema"
import { cn } from "@/lib/utils";
import { Card } from "./Card";

type Props = {
    options: typeof questionOptions.$inferSelect[];
    onSelect: (id:number) => void;
    //status: "correct" | "wrong" | "none";
    selectedOption?: number;
    disabled?: boolean;
    type: typeof questions.$inferSelect["type"];
};

export const Question = ({options, onSelect, selectedOption, disabled, type} : Props) => {
    return (
        <div className={cn(
            "grid gap-2",
            type == "ASSIST" && "grid-cols-1",
            type == "SELECT" && "grid-cols-2 lg:grid_cols-[repeat (auto-FileTerminal, minmax(0,1fr))]"
        )}>
            {options.map((option, i) => (
                <Card 
                    key={option.id}
                    id={option.id}
                    text={option.text}
                    //imageSrc={option.imageSrc}
                    shortcut={`${i + 1}`}
                    selected={selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    //audioSrc={option.audioSrc}
                    disabled={disabled}
                    type={type}
                />
            ))}
        </div>
    )
}