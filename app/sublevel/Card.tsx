import { questions } from "@/db/schema";
import { cn } from "@/lib/utils";

type Props = {
  id: number;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  type: typeof questions.$inferSelect["type"];
};

export const Card = ({ id, text, shortcut, selected, onClick, disabled, type }: Props) => {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      className={cn(
        "relative h-full min-h-[80px] border-2 rounded-xl border-b-4 p-4 lg:p-6 cursor-pointer transition-all duration-200",
        "hover:bg-black/5 active:border-b-2 active:translate-y-[2px]",
        selected && "border-sky-400 bg-sky-100 hover:bg-sky-100 shadow-md",
        !selected && "border-gray-200 hover:border-gray-300",
        disabled && "pointer-events-none opacity-50 hover:bg-white cursor-not-allowed",
        type === "ASSIST" && "text-center",
        type === "YES_NO" && "flex items-center justify-center font-semibold text-lg"
      )}
    >
      {/* Shortcut indicator */}
      {!disabled && (
        <span className={cn(
          "absolute top-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded",
          selected 
            ? "bg-sky-200 text-sky-800" 
            : "bg-gray-100 text-gray-500"
        )}>
          {shortcut}
        </span>
      )}
      
      {/* Main content */}
      <div className={cn(
        "pr-8", // Make room for shortcut
        type === "YES_NO" && "pr-0 flex items-center justify-center h-full"
      )}>
        {text}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute bottom-2 left-2">
          <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};