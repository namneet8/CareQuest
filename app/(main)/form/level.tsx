import { sublevels, levels } from "@/db/schema";
import { LevelBanner } from "./level-banner";
import { SublevelButton } from "./sublevel-button"; 
type Props = {
  id: number;
  order: number;
  title: string;
  description: string;
  sublevel: (typeof sublevels.$inferSelect & {
    completed: boolean;
  })[];
  activeSublevel: typeof sublevels.$inferSelect & {
    level: typeof levels.$inferSelect;
  } | undefined;
  activeSublevelPercentage: number;
};

export const Level = ({
  id,
  order,
  title,
  description,
  sublevel,
  activeSublevel,
  activeSublevelPercentage,
}: Props) => {
  return (
    <>
      <LevelBanner title={title} description={description} />
      <div className="flex items-center flex-col relative">
        {sublevel.map((sub, index) => {
          const isCurrent = sub.id === activeSublevel?.id;
          const isCompleted = sub.completed;
          const isLocked = !isCompleted && !isCurrent;

          return (
            <SublevelButton
              key={sub.id}
              id={sub.id}
              index={index}
              totalCount={sublevel.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={isCurrent ? activeSublevelPercentage : isCompleted ? 100 : 0}
              level={order}
            />
          );
        })}
      </div>
    </>
  );
};
