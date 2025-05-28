export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getFormProgress, getLevels, getSublevel } from "@/db/queries";
import { Ques } from "./ques";

export default async function SublevelPage() {
  const levels = await getLevels();
  const formProgress = await getFormProgress();
  if (!formProgress?.activeSublevelId) redirect("/form");

  const sublevelIds = levels
    .flatMap((lvl) => lvl.sublevel)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id);

  const sublevel = await getSublevel(formProgress.activeSublevelId);
  if (!sublevel) redirect("/form");

  // Calculate initial percentage based on answered questions
  let answeredCount = 0;
  const totalQuestions = sublevel.questions.length;
  
  for (const question of sublevel.questions) {
    const hasResponse = question.userResponse && (
      question.userResponse.responseText ||
      question.userResponse.responseNumber !== null ||
      question.userResponse.selectedOptionId
    );
    if (hasResponse || question.completed) {
      answeredCount++;
    }
  }

  const initialPercentage = totalQuestions > 0 ? 
    Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Find the level and determine if this is the crown level
  const currentLevel = levels.find((lvl) =>
    lvl.sublevel.some((sub) => sub.id === sublevel.id)
  );
  const levelId = currentLevel?.id || 1; // Fallback to 1 if not found
  const isCrownLevel = currentLevel
    ? sublevel.order === Math.max(...currentLevel.sublevel.map(s => s.order))
    : false;

  return (
    <Ques
      initialSublevelId={sublevel.id}
      sublevelIds={sublevelIds}
      initialSublevelQuestions={sublevel.questions}
      initialPercentage={initialPercentage}
      levelId={levelId}
      isCrownLevel={isCrownLevel}
    />
  );
}


