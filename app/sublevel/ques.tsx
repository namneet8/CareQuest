"use client";

import { questionOptions, questions } from "@/db/schema";
import { useState, useEffect } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Question } from "./question";

type Props = {
  initialPercentage: number,
  initialSublevelId: number,
  initialSublevelQuestions: (typeof questions.$inferSelect & {
    completed: boolean;
    questionOptions: typeof questionOptions.$inferSelect[];
    children?: any[];
    userResponse?: any;
  })[];
  initialAnswers?: Record<number, string | number>;
};

export const Ques = ({
  initialPercentage,
  initialSublevelId,
  initialSublevelQuestions,
  initialAnswers = {},
}: Props) => {
  const [percentage, setPercentage] = useState(initialPercentage);
  const [answers, setAnswers] = useState<Record<number, string | number>>(initialAnswers);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const questions = initialSublevelQuestions;

  const currentQuestion = questions[activeIndex];
  const options = currentQuestion?.questionOptions ?? [];
  const title =
    currentQuestion.type === "ASSIST"
      ? "Select the Option that suits you the best."
      : currentQuestion.questionText;

  // Load previous answers on component mount
  useEffect(() => {
    const loadPreviousAnswers = () => {
      const previousAnswers: Record<number, string | number> = {};
      
      questions.forEach((question) => {
        if (question.userResponse) {
          if (question.userResponse.responseText) {
            previousAnswers[question.id] = question.userResponse.responseText;
          } else if (question.userResponse.responseNumber !== null) {
            previousAnswers[question.id] = question.userResponse.responseNumber;
          } else if (question.userResponse.selectedOptionId) {
            const selectedOption = question.questionOptions.find(
              opt => opt.id === question.userResponse?.selectedOptionId
            );
            previousAnswers[question.id] = selectedOption?.text || question.userResponse.selectedOptionId;
          }
        }
        
        // Load answers for child questions
        if (question.children) {
          question.children.forEach((child: any) => {
            if (child.userResponse) {
              if (child.userResponse.responseText) {
                previousAnswers[child.id] = child.userResponse.responseText;
              } else if (child.userResponse.responseNumber !== null) {
                previousAnswers[child.id] = child.userResponse.responseNumber;
              }
            }
          });
        }
      });
      
      setAnswers(prevAnswers => ({ ...prevAnswers, ...previousAnswers }));
    };

    loadPreviousAnswers();
  }, [questions]);

  const saveResponse = async (questionId: number, response: string | number, optionId?: number) => {
    try {
      setSaving(true);
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          response,
          optionId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save response');
      }

      return true;
    } catch (error) {
      console.error('Error saving response:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = async (questionId: number, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Determine optionId for SELECT type questions
    const question = questions.find(q => q.id === questionId);
    let optionId: number | undefined;
    
    if (question && ["SELECT", "YES_NO"].includes(question.type)) {
      if (question.type === "SELECT") {
        optionId = typeof value === 'number' ? value : undefined;
      } else if (question.type === "YES_NO") {
        // For YES_NO, we need to find the option that matches the text
        const option = question.questionOptions.find(opt => opt.text === value);
        optionId = option?.id;
      }
    }

    // Save to database
    await saveResponse(questionId, value, optionId);
  };

  const handleNext = () => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < questions.length) {
      setActiveIndex(nextIndex);
      // Update percentage based on progress
      setPercentage(Math.round(((nextIndex + 1) / questions.length) * 100));
    } else {
      // All questions completed
      console.log("All answers:", answers);
      // You can handle completion here (e.g., submit to server)
    }
  };

  const shouldShowChild = (child: any) => {
    const parentAnswer = answers[child.parentQuestionId];
    return parentAnswer && parentAnswer.toString().toLowerCase() === "yes";
  };

  const canProceed = () => {
    const currentAnswer = answers[currentQuestion.id];
    
    // For mandatory questions, require an answer
    if (currentQuestion.mandatory && !currentAnswer) {
      return false;
    }
    
    // For subquestions, check if they need answers too
    if (currentQuestion.children) {
      for (const child of currentQuestion.children) {
        if (shouldShowChild(child) && !answers[child.id]) {
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSkip = () => {
    if (!currentQuestion.mandatory) {
      if (currentQuestion.importanceDescription) {
        const proceed = window.confirm(
          `${currentQuestion.importanceDescription}\n\nAre you sure you want to skip this question?`
        );
        if (proceed) {
          handleNext();
        }
      } else {
        handleNext();
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Questions Completed!</h2>
          <p>Thank you for completing all questions.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header percentage={percentage} />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <div className="flex justify-between items-center">
              <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                {title}
              </h1>
              <span className="text-sm text-gray-500">
                {activeIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div>
              {currentQuestion.type === "ASSIST" && (
                <QuestionBubble question={currentQuestion.questionText} />
              )}

              <Question
                options={options}
                onSelect={async (value) => {
                  await handleAnswer(currentQuestion.id, value);
                  
                  // Auto-advance for certain question types
                  if (["SELECT", "YES_NO", "RATE"].includes(currentQuestion.type)) {
                    setTimeout(() => {
                      if (canProceed()) {
                        handleNext();
                      }
                    }, 500); // Slightly longer delay to ensure save completes
                  }
                }}
                selectedOption={answers[currentQuestion.id]}
                disabled={saving}
                type={currentQuestion.type}
              />

              {/* Render subquestions if applicable */}
              {currentQuestion.children &&
                currentQuestion.children.map((child: any) =>
                  shouldShowChild(child) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg" key={child.id}>
                      <p className="text-sm font-semibold mb-2">{child.questionText}</p>
                      <input
                        className="mt-2 p-2 border rounded w-full"
                        type="text"
                        placeholder="Enter your response"
                        value={answers[child.id] || ""}
                        onChange={async (e) => {
                          await handleAnswer(child.id, e.target.value);
                        }}
                      />
                    </div>
                  )
                )}

              <div className="flex justify-between items-center mt-6">
                <div>
                  {!currentQuestion.mandatory && (
                    <button
                      className="text-blue-600 hover:text-blue-800 underline"
                      onClick={handleSkip}
                    >
                      Skip this question
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {activeIndex > 0 && (
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                      onClick={() => {
                        setActiveIndex(activeIndex - 1);
                        setPercentage(Math.round((activeIndex / questions.length) * 100));
                      }}
                    >
                      Previous
                    </button>
                  )}
                  
                  {/* Show Next button for manual progression types or when auto-advance conditions aren't met */}
                  {(["FILL", "TEXT", "DATE", "ASSIST"].includes(currentQuestion.type) || 
                    !canProceed()) && (
                    <button
                      className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
                        canProceed() && !saving
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={handleNext}
                      disabled={!canProceed() || saving}
                    >
                      {saving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {activeIndex === questions.length - 1 ? "Complete" : "Next"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};