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
    // Check if question has any response
    const hasResponse = question.userResponse && (
      question.userResponse.responseText ||
      question.userResponse.responseNumber !== null ||
      question.userResponse.selectedOptionId
    );
    
    // Also check if marked as completed
    if (hasResponse || question.completed) {
      answeredCount++;
    }
  }

  const initialPercentage = totalQuestions > 0 ? 
    Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <Ques
      initialSublevelId={sublevel.id}
      sublevelIds={sublevelIds}
      initialSublevelQuestions={sublevel.questions}
      initialPercentage={initialPercentage}
    />
  );
}


