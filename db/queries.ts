import { cache } from "react";
import db from "@/db/drizzle";
import { levels, sublevels, questions, questionProgress, userResponses, questionOptions } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

// db/queries.ts
// 1) Fetch every fully completed sublevel, mapping selectedOptionId → option.text first
export const getCompletedSublevelsWithResponses = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const all = await db.query.levels.findMany({
    orderBy: (l, { asc }) => [asc(l.order)],
    with: {
      sublevel: {
        orderBy: (s, { asc }) => [asc(s.order)],
        with: {
          questions: {
            orderBy: (q, { asc }) => [asc(q.order)],
            with: {
              questionProgress: {
                where: eq(questionProgress.userId, userId)
              },
              userResponses: {
                where: eq(userResponses.userId, userId),
                orderBy: (ur, { desc }) => [desc(ur.updatedAt)],
                limit: 1
              },
              questionOptions: true
            }
          }
        }
      }
    }
  });

  const completedGroups: {
    levelTitle: string;
    sublevelTitle: string;
    questions: Array<{ questionText: string; responseText: string }>;
  }[] = [];

  for (const lvl of all) {
    for (const sub of lvl.sublevel) {
      const allDone = sub.questions.every(q =>
        q.questionProgress.length > 0 &&
        q.questionProgress.every(p => p.completed)
      );
      if (!allDone) continue;

      const qs = sub.questions.map(q => {
        const resp = q.userResponses[0];
        let text = "";

        if (resp) {
          if (resp.responseText) {
            // free-text answers
            text = resp.responseText;
          } else if (resp.selectedOptionId != null) {
            // SELECT / YES_NO → lookup option text first
            const opt = q.questionOptions.find(o => o.id === resp.selectedOptionId);
            text = opt?.text ?? String(resp.selectedOptionId);
          } else if (resp.responseNumber != null) {
            // numeric/rating answers
            text = String(resp.responseNumber);
          }
        }

        return {
          questionText: q.questionText,
          responseText: text
        };
      });

      completedGroups.push({
        levelTitle: lvl.title,
        sublevelTitle: sub.title,
        questions: qs
      });
    }
  }

  return completedGroups;
});

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

// Function to save user response and update progress
export const saveUserResponse = async (
  questionId: number, 
  response: string | number,
  optionId?: number
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Check if response already exists
    const existingResponse = await db.query.userResponses.findFirst({
      where: and(
        eq(userResponses.userId, userId),
        eq(userResponses.questionId, questionId)
      )
    });

    const responseData = {
      userId,
      questionId,
      responseText: typeof response === 'string' ? response : null,
      responseNumber: typeof response === 'number' ? response : null,
      selectedOptionId: optionId || null,
      updatedAt: new Date(),
    };

    if (existingResponse) {
      // Update existing response
      await db.update(userResponses)
        .set(responseData)
        .where(eq(userResponses.id, existingResponse.id));
    } else {
      // Create new response
      await db.insert(userResponses).values({
        ...responseData,
        createdAt: new Date(),
      });
    }

    // Update or create question progress
    const existingProgress = await db.query.questionProgress.findFirst({
      where: and(
        eq(questionProgress.userId, userId),
        eq(questionProgress.questionId, questionId)
      )
    });

    if (existingProgress) {
      await db.update(questionProgress)
        .set({ 
          completed: true,
          completedAt: new Date()
        })
        .where(eq(questionProgress.id, existingProgress.id));
    } else {
      await db.insert(questionProgress).values({
        userId,
        questionId,
        completed: true,
        completedAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving user response:", error);
    throw new Error("Failed to save response");
  }
};

export const getUserResponses = async (sublevelId: number) => {
  const { userId } = await auth();
  if (!userId) return {};

  const sublevel = await getSublevel(sublevelId);
  if (!sublevel) return {};

  const responses: Record<number, string | number> = {};

  for (const question of sublevel.questions) {
    const r = question.userResponse;
    if (r) {
      if (r.responseText) {
        responses[question.id] = r.responseText;
      } else if (r.selectedOptionId != null) {
        const opt = question.questionOptions.find(o => o.id === r.selectedOptionId);
        responses[question.id] = opt?.text ?? r.selectedOptionId;
      } else if (r.responseNumber != null) {
        responses[question.id] = r.responseNumber;
      }
    }
    // children too
    for (const child of question.children ?? []) {
      const cr = child.userResponse;
      if (cr) {
        if (cr.responseText) {
          responses[child.id] = cr.responseText;
        } else if (cr.responseNumber != null) {
          responses[child.id] = cr.responseNumber;
        }
      }
    }
  }

  return responses;
};