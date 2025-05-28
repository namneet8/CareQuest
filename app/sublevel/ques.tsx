"use client";

import { questionOptions, questions } from "@/db/schema";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Question } from "./question";
import { Button } from "@/components/ui/button";

type Props = {
  initialPercentage: number;
  initialSublevelId: number;
  sublevelIds: number[];
  initialSublevelQuestions: (typeof questions.$inferSelect & {
    completed: boolean;
    questionOptions: typeof questionOptions.$inferSelect[];
    children?: any[];
    userResponse?: any;
    type: string;
  })[];
  initialAnswers?: Record<number, string | number>;
};

export const Ques = ({
  initialPercentage,
  initialSublevelId,
  sublevelIds,
  initialSublevelQuestions: qs,
  initialAnswers = {},
}: Props) => {
  const router = useRouter();

  // State
  const [percentage, setPercentage] = useState(initialPercentage);
  const [answers, setAnswers] = useState({ ...initialAnswers });
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const current = qs[activeIndex];

  // Merge saved responses on mount
  useEffect(() => {
    const loaded: Record<number, string | number> = {};
    for (const q of qs) {
      if (q.userResponse) {
        if (q.userResponse.responseText) loaded[q.id] = q.userResponse.responseText;
        else if (q.userResponse.responseNumber !== null) loaded[q.id] = q.userResponse.responseNumber;
        else if (q.userResponse.selectedOptionId) {
          const o = q.questionOptions.find((o) => o.id === q.userResponse!.selectedOptionId);
          loaded[q.id] = o?.text ?? q.userResponse!.selectedOptionId;
        }
      }
      for (const c of q.children ?? []) {
        if (c.userResponse) {
          if (c.userResponse.responseText) loaded[c.id] = c.userResponse.responseText;
          else if (c.userResponse.responseNumber !== null) loaded[c.id] = c.userResponse.responseNumber;
        }
      }
    }
    setAnswers((a) => ({ ...a, ...loaded }));
  }, [qs]);

  const saveResponse = async (
    questionId: number,
    response: string | number,
    optionId?: number
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, response, optionId }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = (qid: number, val: string | number) => {
    setAnswers((a) => ({ ...a, [qid]: val }));
  };

  // ques.tsx
const handleNext = async () => {
  const val = answers[current.id];
  if (val !== undefined) {
    let optionId: number | undefined;
    if (["SELECT", "YES_NO"].includes(current.type)) {
      if (current.type === "SELECT" && typeof val === "number") optionId = val;
      else if (current.type === "YES_NO") {
        const o = current.questionOptions.find((o) => o.text === val);
        optionId = o?.id;
      }
    }
    await saveResponse(current.id, val, optionId);
  }
  for (const c of current.children ?? []) {
    const cv = answers[c.id];
    if (cv !== undefined) await saveResponse(c.id, cv);
  }
  const next = activeIndex + 1;
  if (next < qs.length) {
    setActiveIndex(next);
    setPercentage(Math.round(((next + 1) / qs.length) * 100));
  } else {
    // Mark all questions in the sublevel as completed
    for (const q of qs) {
      await saveResponse(q.id, answers[q.id] || "", undefined); // Save even if no answer to mark as completed
      for (const c of q.children ?? []) {
        await saveResponse(c.id, answers[c.id] || "", undefined);
      }
    }
    setPercentage(100);
    setShowModal(true);
  }
};

  const handlePrevious = () => {
    if (activeIndex === 0) return;
    const prev = activeIndex - 1;
    setActiveIndex(prev);
    setPercentage(Math.round(((prev + 1) / qs.length) * 100));
  };

  const shouldShowChild = (child: any) =>
    answers[child.parentQuestionId]?.toString().toLowerCase() === "yes";

  const canProceed = () => {
    const mainAns = answers[current.id];
    // If mandatory, ensure the main question is answered
    if (current.mandatory && (mainAns === undefined || mainAns === "")) {
      return false;
    }
    // For YES_NO questions: once answered (Yes or No), allow proceeding—children only matter on Yes
    if (current.type === "YES_NO") {
      return mainAns !== undefined && mainAns !== "";
    }
    // If this question has children and the answer is "yes", require all child answers
    if (
      current.children &&
      current.children.length > 0 &&
      answers[current.id]?.toString().toLowerCase() === "yes"
    ) {
      for (const c of current.children) {
        const childAns = answers[c.id];
        if (childAns === undefined || childAns === "") {
          return false;
        }
      }
    }
    return true;
  };

  const handleSkip = () => {
    if (!current.mandatory) {
      if (current.importanceDescription && !confirm(`${current.importanceDescription}\n\nSkip?`)) return;
      handleNext();
    }
  };

  const handleContinue = async () => {
    setShowModal(false);
    await router.push("/form");
    router.refresh();
  };

  if (!current) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">All Done!</h2>
          <p>Thank you for completing all questions.</p>
        </div>
      </div>
    );
  }

  const title =
    current.type === "ASSIST"
      ? "Select the Option that suits you best."
      : current.questionText;

  return (
    <>
      <Header percentage={percentage} />

      <div className="mt-8 flex-1 flex items-start justify-center">
        <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-8">
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">{title}</h1>
            <span className="text-sm text-gray-500">{activeIndex + 1} of {qs.length}</span>
          </div>

          {current.type === "ASSIST" && (
            <QuestionBubble question={current.questionText} />
          )}

          <Question
            options={current.questionOptions}
            type={current.type}
            disabled={saving}
            selectedOption={answers[current.id]}
            onSelect={(v) => handleAnswer(current.id, v)}
          />

          {current.children?.map((child: any) =>
            shouldShowChild(child) ? (
              <div key={child.id} className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">{child.questionText}</p>
                <input
                  className="mt-2 p-2 border rounded w-full"
                  placeholder="Enter your response"
                  value={answers[child.id] || ""}
                  onChange={(e) => setAnswers(a => ({ ...a, [child.id]: e.target.value }))}
                />
              </div>
            ) : null
          )}

          <div className="flex justify-center items-center gap-4 mt-6">
            {!current.mandatory && (
              <Button variant="danger" onClick={handleSkip}>Skip</Button>
            )}
            <Button variant="secondary" onClick={handlePrevious} disabled={activeIndex === 0}>Previous</Button>
            <Button onClick={handleNext} disabled={!canProceed() || saving}>
              {saving ? "Saving…" : activeIndex === qs.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="mb-6">
              You have earned <span className="font-semibold">10 points</span>!
            </p>
            <Button onClick={handleContinue}>Continue</Button>
          </div>
        </div>
      )}
    </>
  );
};



