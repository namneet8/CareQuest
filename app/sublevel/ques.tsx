
"use client";

import { questionOptions, questions } from "@/db/schema";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Question } from "./question";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import Image from "next/image";

type Props = {
  initialPercentage: number;
  initialSublevelId: number;
  sublevelIds: number[];
  levelId: number;
  isCrownLevel: boolean;
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
  levelId,
  isCrownLevel,
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
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [spinsEarned, setSpinsEarned] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [encouragingMessage, setEncouragingMessage] = useState("");

  const current = qs[activeIndex];

  // Encouraging messages for non-crown levels
  const encouragingMessages = [
    "Great job! You're one step closer to unlocking your full health report!",
    "Awesome progress! Keep going to complete all levels and earn more rewards!",
    "You're doing fantastic! Just a few more levels to reach the final level!",
    "Well done! Continue crushing it to reach the final level!",
  ];

  // Handle body scroll for modals
  useEffect(() => {
    setMounted(true);
    if (showModal || showSkipModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, showSkipModal]);

  // Set random encouraging message for completion modal
  useEffect(() => {
    if (showModal && !isCrownLevel) {
      const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
      setEncouragingMessage(encouragingMessages[randomIndex]);
    }
  }, [showModal, isCrownLevel]);

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

  const updateUserPoints = async (pointsToAdd: number) => {
    console.log("🎯 Attempting to update points:", pointsToAdd);
    try {
      const res = await fetch("/api/update-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pointsToAdd }),
      });
      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Update points failed:", res.status, errorText);
        throw new Error(`Failed to update points: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      console.log("✅ Points updated successfully:", data);
      if (data.spinsEarned > 0) {
        setSpinsEarned(data.spinsEarned);
      }
      return {
        newPoints: data.newPoints,
        spinsEarned: data.spinsEarned,
      };
    } catch (e) {
      console.error("❌ Failed to update points:", e);
      return null;
    }
  };

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
      for (const q of qs) {
        await saveResponse(q.id, answers[q.id] || "", undefined);
        for (const c of q.children ?? []) {
          await saveResponse(c.id, answers[c.id] || "", undefined);
        }
      }
      console.log("🏆 Sublevel completed, awarding points...");
      const result = await updateUserPoints(20);
      if (result !== null) {
        console.log("✅ Points awarded successfully. New total:", result.newPoints);
        if (result.spinsEarned > 0) {
          console.log("🎰 Spins earned:", result.spinsEarned);
        }
      } else {
        console.log("⚠️ Points update failed, but continuing...");
      }
      setPercentage(100);
      setShowModal(true);
    }
  };

  const handleAnswer = (qid: number, val: string | number) => {
    setAnswers((a) => ({ ...a, [qid]: val }));
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
    if (current.mandatory && (mainAns === undefined || mainAns === "")) {
      return false;
    }
    if (current.type === "YES_NO") {
      return mainAns !== undefined && mainAns !== "";
    }
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
      setShowSkipModal(true);
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipModal(false);
    handleNext();
  };

  const handleCancelSkip = () => {
    setShowSkipModal(false);
  };

  const handleContinue = async () => {
    setShowModal(false);
    setSpinsEarned(0);
    await router.push("/form");
    router.refresh();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/generate-report?levelId=${levelId}&sublevelId=${initialSublevelId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }
      const { url, fileName } = await response.json();
      const pdfResponse = await fetch(url);
      if (!pdfResponse.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await pdfResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setSpinsEarned(0);
      await router.push("/form");
      router.refresh();
    } catch (e) {
      console.error("Download failed:", e);
      alert(`Failed to download the report: ${e}. Please try again.`);
    }
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

  const reportTitle =
    levelId === 1 ? "Basic Health Report" :
    levelId === 2 ? "Intermediate Health Report" :
    levelId === 3 ? "Complete Health Report" : "Health Report";

  // Completion Modal
  const completionModalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="mb-4">
            <div className="text-7xl">🎉</div>
          </div>

          {/* Reward Image */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Image
                src={isCrownLevel ? "/happy.gif" : "/happy.gif"}
                width={150}
                height={150}
                alt={isCrownLevel ? "Health Report" : "Points Earned"}
                className="rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/reward-generic.png";
                }}
              />
              <div className="absolute -top-1 -right-1 text-3xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-bounce delay-150">🌟</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Congratulations!
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6 text-lg">
            {isCrownLevel
              ? `Your ${reportTitle} is ready!`
              : encouragingMessage}
          </p>

          {/* Points/Spins Info */}
          {!isCrownLevel && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-semibold">
                You have earned <span className="font-bold">20 points</span>!
              </p>
            </div>
          )}
          {spinsEarned > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-semibold">
                🎰 Bonus: You earned {spinsEarned} spin{spinsEarned > 1 ? "s" : ""}!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isCrownLevel && (
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
                onClick={handleDownload}
              >
                Download Report
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleContinue}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Skip Confirmation Modal
  const skipModalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowSkipModal(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setShowSkipModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Question Icon */}
          <div className="mb-4">
            <div className="text-6xl">❓</div>
          </div>

          {/* Image */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Image
                src="/reward-generic.png"
                width={120}
                height={120}
                alt="Skip Question"
                className="rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/reward-generic.png";
                }}
              />
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-150">🌟</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Skip This Question?
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6 text-lg">
            {current.importanceDescription
              ? `${current.importanceDescription} Are you sure you want to skip this question?`
              : "Are you sure you want to skip this question?"}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
              onClick={handleConfirmSkip}
            >
              Skip
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelSkip}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header percentage={percentage} />

      <div className="mt-8 flex-1 flex items-start justify-center">
        <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-8">
          <div className="text-center">
            {current.type !== null && (
              <QuestionBubble question={current.questionText} />
            )}
            <span className="text-sm text-gray-500">
              {activeIndex + 1} of {qs.length}
            </span>
          </div>

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
                  onChange={(e) => setAnswers((a) => ({ ...a, [child.id]: e.target.value }))}
                />
              </div>
            ) : null
          )}

          <div className="flex justify-center items-center gap-4 mt-6">
            {!current.mandatory && (
              <Button variant="danger" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={activeIndex === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!canProceed() || saving}>
              {saving ? "Saving…" : activeIndex === qs.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {mounted && showModal && createPortal(completionModalContent, document.body)}
      {mounted && showSkipModal && createPortal(skipModalContent, document.body)}
    </>
  );
};
