import { cache } from "react";
import db from "@/db/drizzle";
import { levels, sublevels, questions, questionProgress, userResponses, questionOptions, userProgress } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export type CompletedGroup = {
  levelTitle: string;
  sublevelTitle: string;
  questions: Array<{
    questionText: string;
    responseText: string;
  }>;
};


export const getCompletedSublevelsWithResponses = cache(
  async (): Promise<CompletedGroup[]> => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.levels.findMany({
      orderBy: (l, { asc }) => [asc(l.order)],
      with: {
        sublevel: {
          orderBy: (s, { asc }) => [asc(s.order)],
          with: {
            questions: {
              orderBy: (q, { asc }) => [asc(q.order)],
              with: {
                // for completed check
                questionProgress: {
                  where: eq(questionProgress.userId, userId),
                },
                // load all options so we can fallback
                questionOptions: true,
                // load just the latest response + join its selectedOption
                userResponses: {
                  where: eq(userResponses.userId, userId),
                  orderBy: (ur, { desc }) => [desc(ur.updatedAt)],
                  limit: 1,
                  with: {
                    selectedOption: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // --- DEBUG: inspect what Drizzle actually returned ---
    console.log("⚙️ getCompletedSublevelsWithResponses raw:", JSON.stringify(data, null, 2));

    const groups: CompletedGroup[] = [];

    for (const lvl of data) {
      for (const sub of lvl.sublevel) {
        const allDone = sub.questions.every(
          (q) =>
            q.questionProgress.length > 0 &&
            q.questionProgress.every((p) => p.completed)
        );
        if (!allDone) continue;

        const qs = sub.questions.map((q) => {
          const resp = q.userResponses[0];
          let responseText = "";

          if (resp) {
            if (resp.responseText) {
              // free‐text / fill
              responseText = resp.responseText;
            } else if (resp.selectedOption) {
              // SELECT / YES_NO via the joined relation
              responseText = resp.selectedOption.text;
            } else if (resp.selectedOptionId != null) {
              // fallback: match against questionOptions array
              const opt = q.questionOptions.find((o) => o.id === resp.selectedOptionId);
              responseText = opt?.text ?? String(resp.selectedOptionId);
            } else if (resp.responseNumber != null) {
              // RATE / RANGE
              responseText = String(resp.responseNumber);
            }
          }

          return {
            questionText: q.questionText,
            responseText,
          };
        });

        groups.push({
          levelTitle: lvl.title,
          sublevelTitle: sub.title,
          questions: qs,
        });
      }
    }

    return groups;
  }
);
/**
 * Returns every sublevel for which *all* questions are completed,
 * along with the *one* latest userResponse (joined to its selectedOption).
 */
// export const getCompletedSublevelsWithResponses = cache(
//   async (): Promise<CompletedGroup[]> => {
//     const { userId } = await auth();
//     if (!userId) return [];

//     // 1) Fetch all levels→sublevels→questions
//     //    include questionProgress + only the last userResponse (with selectedOption)
//     const data = await db.query.levels.findMany({
//       orderBy: (l, { asc }) => [asc(l.order)],
//       with: {
//         sublevel: {
//           orderBy: (s, { asc }) => [asc(s.order)],
//           with: {
//             questions: {
//               orderBy: (q, { asc }) => [asc(q.order)],
//               with: {
//                 questionProgress: {
//                   where: eq(questionProgress.userId, userId),
//                 },
//                 userResponses: {
//                   where: eq(userResponses.userId, userId),
//                   orderBy: (ur, { desc }) => [desc(ur.updatedAt)],
//                   limit: 1,
//                   with: {
//                     selectedOption: true,   // ← join here
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     const groups: CompletedGroup[] = [];

//     for (const lvl of data) {
//       for (const sub of lvl.sublevel) {
//         // only keep sublevels where *every* questionProgress.completed === true
//         const allDone = sub.questions.every(
//           (q) =>
//             q.questionProgress.length > 0 &&
//             q.questionProgress.every((p) => p.completed)
//         );
//         if (!allDone) continue;

//         // map each question → its single responseText
//         const qs = sub.questions.map((q) => {
//           const resp = q.userResponses[0];
//           let responseText = "";

//           if (resp) {
//             if (resp.responseText) {
//               // open-ended / fill
//               responseText = resp.responseText;
//             } else if (resp.selectedOption) {
//               // SELECT / YES_NO
//               responseText = resp.selectedOption.text;
//             } else if (resp.responseNumber != null) {
//               // RATE / RANGE
//               responseText = String(resp.responseNumber);
//             }
//           }

//           return {
//             questionText: q.questionText,
//             responseText,
//           };
//         });

//         groups.push({
//           levelTitle: lvl.title,
//           sublevelTitle: sub.title,
//           questions: qs,
//         });
//       }
//     }

//     return groups;
//   }
// );

export const getLevels = cache(async () => {
  const {userId} = await auth();
  
  if(!userId){
    return [];
  }
  const data = await db.query.levels.findMany({
    with: {
      sublevel: {
        with: {
          questions: {
            with: {
              questionProgress: {
                where: eq(questionProgress.userId, userId)
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((level) => {
    const sublevelWithCompletedStatus = level.sublevel.map((sub) => {
      if(sub.questions.length === 0){
        return {...sub, completed: false};
      }
      
      const allCompletedQuestions = sub.questions.every((question) => {
        return (
          question.questionProgress &&
          question.questionProgress.length > 0 &&
          question.questionProgress.every((progress) => progress.completed)
        );
      });

      return {
        ...sub,
        completed: allCompletedQuestions,
      };
    });

    return {
      ...level,
      sublevel: sublevelWithCompletedStatus,
    };
  });

  return normalizedData;
});

export const getFormProgress = cache(async () => {
  const {userId} = await auth();
  
  if(!userId){
    return null;
  }

  const levelsInForm = await db.query.levels.findMany({
    orderBy: (levels, {asc}) => [asc(levels.order)],
    with: {
      sublevel: {
        orderBy: (sublevels, { asc}) => [asc(sublevels.order)],
        with: {
          level: true,
          questions: {
            with: {
              questionProgress: {
                where: eq(questionProgress.userId, userId),
              }
            }
          }
        }
      }
    }
  })

  const firstUncompletedSublevel = levelsInForm
    .flatMap((level) => level.sublevel)
    .find((sublevel) => {
      return sublevel.questions.some((question) => {
        return !question.questionProgress || 
               question.questionProgress.length === 0 || 
               question.questionProgress.some((progress) => progress.completed === false);
      })
    })

    return {
      activeSublevel: firstUncompletedSublevel,
      activeSublevelId: firstUncompletedSublevel?.id,
    }
});

export const getSublevel = cache(async (id?: number) => {
  const { userId} = await auth();

  if(!userId){
    return null;
  }

  const formProgress = await getFormProgress();
  const sublevelId = id || formProgress?.activeSublevelId;

  if(!sublevelId) {
    return null;
  }

  const data = await db.query.sublevels.findFirst({
    where: eq(sublevels.id, sublevelId),
    with: {
      questions: {
        orderBy: (questions, {asc}) => [asc(questions.order)],
        with: {
          questionOptions: true,
          questionProgress: {
            where: eq(questionProgress.userId, userId)
          },
          userResponses: {
            where: eq(userResponses.userId, userId)
          }
        },
      },
    },
  });

  if(!data || !data.questions) {
    return null;
  }

  // Add completed flag and user responses
  const enrichedQuestions = data.questions.map((question) => ({
    ...question,
    completed:
      question.questionProgress &&
      question.questionProgress.length > 0 &&
      question.questionProgress.every((progress) => progress.completed),
    userResponse: question.userResponses[0] || null, // Get the most recent response
  }));

  // Group questions by parent-child relationship
  const parentQuestions = enrichedQuestions.filter((q) => q.parentQuestionId === null);
  const subQuestionsMap = new Map<number, typeof enrichedQuestions>();

  enrichedQuestions.forEach((q) => {
    if (q.parentQuestionId !== null) {
      if (!subQuestionsMap.has(q.parentQuestionId)) {
        subQuestionsMap.set(q.parentQuestionId, []);
      }
      subQuestionsMap.get(q.parentQuestionId)!.push(q);
    }
  });

  // Attach children to parents
  const normalizedQuestions = parentQuestions.map((parent) => ({
    ...parent,
    children: subQuestionsMap.get(parent.id) || [],
  }));
  
  return { ...data, questions: normalizedQuestions}
});

export const getSublevelPercentage = cache(async () => {
  const formProgress = await getFormProgress();

  if (!formProgress?.activeSublevelId) {
    return 0;
  }

  const sublevel = await getSublevel(formProgress.activeSublevelId);

  if(!sublevel){
    return 0;
  }

  const completedQuestions = sublevel.questions.filter((question) => question.completed);
  const percentage = Math.round((completedQuestions.length / sublevel.questions.length) * 100)

  return percentage;
});

export const saveUserResponse = async (
  questionId: number,
  response: string | number,
  optionId?: number
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  console.log("💾 saveUserResponse called with:", { questionId, response, optionId }); // Debug log

  let responseText: string | null = null;
  let responseNumber: number | null = null;
  let selectedOptionId: number | null = optionId ?? null;

  if (typeof response === "string") {
    // Text response (including option text)
    responseText = response;
  } else if (typeof response === "number") {
    // Numeric response for RATE/RANGE questions
    responseNumber = response;
  }

  const responseData = {
    userId,
    questionId,
    responseText,
    responseNumber,
    selectedOptionId,
    updatedAt: new Date(),
  };

  console.log("💾 Saving response data:", responseData); // Debug log

  // Upsert into userResponses:
  const existing = await db.query.userResponses.findFirst({
    where: and(
      eq(userResponses.userId, userId),
      eq(userResponses.questionId, questionId)
    ),
  });

  if (existing) {
    await db.update(userResponses)
      .set(responseData)
      .where(eq(userResponses.id, existing.id));
  } else {
    await db.insert(userResponses).values({
      ...responseData,
      createdAt: new Date(),
    });
  }

  // Mark progress complete
  const prog = await db.query.questionProgress.findFirst({
    where: and(
      eq(questionProgress.userId, userId),
      eq(questionProgress.questionId, questionId)
    ),
  });
  if (prog) {
    await db.update(questionProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(questionProgress.id, prog.id));
  } else {
    await db.insert(questionProgress).values({
      userId,
      questionId,
      completed: true,
      completedAt: new Date(),
    });
  }

  return { success: true };
};
export const getUserProgress = cache(async () => {
  const { userId } =  await auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: {
      points: true,
      spins: true,
      activeLevelId: true,
      activeSublevelId: true,
    },
  });

  return data;
});

// Alternative function if you want to keep getUserPoints separate
export const getUserPoints = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: {
      points: true,
      spins: true,
    },
  });

  return data;
});