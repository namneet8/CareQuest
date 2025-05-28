import { questionOptions, questions } from "@/db/schema"
import { cn } from "@/lib/utils";
import { Card } from "./Card";

type Props = {
    options: typeof questionOptions.$inferSelect[];
    onSelect: (value: string | number) => void;
    selectedOption?: string | number;
    disabled?: boolean;
    type: typeof questions.$inferSelect["type"];
};

export const Question = ({ options, onSelect, selectedOption, disabled, type }: Props) => {
    if (type === "FILL" || type === "TEXT") {
        return (
            <div className="w-full">
                <input
                    className="border-2 rounded-md p-3 w-full focus:border-sky-400 focus:outline-none transition-colors"
                    type="text"
                    placeholder="Enter your response here..."
                    disabled={disabled}
                    value={selectedOption as string || ""}
                    onChange={(e) => onSelect(e.target.value)}
                />
            </div>
        );
    }

    if (type === "RATE") {
        return (
            <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        disabled={disabled}
                        onClick={() => onSelect(value)}
                        className={cn(
                            "w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 hover:scale-110",
                            selectedOption === value 
                                ? "bg-sky-500 border-sky-500 text-white" 
                                : "bg-white border-gray-300 text-gray-700 hover:border-sky-300 hover:bg-sky-50",
                            disabled && "opacity-50 cursor-not-allowed hover:scale-100"
                        )}
                    >
                        {value}
                    </button>
                ))}
            </div>
        );
    }

    if (type === "DATE") {
        return (
            <div className="w-full">
                <input
                    type="date"
                    className="border-2 rounded-md p-3 w-full focus:border-sky-400 focus:outline-none transition-colors"
                    disabled={disabled}
                    value={selectedOption as string || ""}
                    onChange={(e) => onSelect(e.target.value)}
                />
            </div>
        );
    }

    if (type === "YES_NO") {
        return (
            <div className="grid grid-cols-2 gap-4">
                {["Yes", "No"].map((label, i) => (
                    <Card
                        key={i}
                        id={i + 1}
                        text={label}
                        shortcut={label[0]}
                        selected={selectedOption === label}
                        onClick={() => onSelect(label)}
                        disabled={disabled}
                        type={type}
                    />
                ))}
            </div>
        );
    }

    // Default case for SELECT and ASSIST types
    return (
        <div className={cn(
            "grid gap-3",
            type === "ASSIST" && "grid-cols-1",
            type === "SELECT" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
        )}>
            {options.map((option, i) => (
                <Card 
                    key={option.id}
                    id={option.id}
                    text={option.text}
                    shortcut={`${i + 1}`}
                    selected={selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    disabled={disabled}
                    type={type}
                />
            ))}
        </div>
    );
};