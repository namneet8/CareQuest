import { cache } from "react";
import db from "@/db/drizzle";
import { questionProgress, sublevels, userResponses, questionOptions } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

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

// Function to get user's previous responses for a sublevel
export const getUserResponses = async (sublevelId: number) => {
  const { userId } = await auth();
  
  if (!userId) {
    return {};
  }

  const sublevel = await getSublevel(sublevelId);
  if (!sublevel) {
    return {};
  }

  const responses: Record<number, string | number> = {};
  
  sublevel.questions.forEach((question) => {
    if (question.userResponse) {
      if (question.userResponse.responseText) {
        responses[question.id] = question.userResponse.responseText;
      } else if (question.userResponse.responseNumber !== null) {
        responses[question.id] = question.userResponse.responseNumber;
      } else if (question.userResponse.selectedOptionId) {
        // For SELECT questions, we might want to return the option ID or text
        const selectedOption = question.questionOptions.find(
          opt => opt.id === question.userResponse?.selectedOptionId
        );
        responses[question.id] = selectedOption?.text || question.userResponse.selectedOptionId;
      }
    }
    
    // Also get responses for child questions
    if (question.children) {
      question.children.forEach((child) => {
        if (child.userResponse) {
          if (child.userResponse.responseText) {
            responses[child.id] = child.userResponse.responseText;
          } else if (child.userResponse.responseNumber !== null) {
            responses[child.id] = child.userResponse.responseNumber;
          }
        }
      });
    }
  });

  return responses;
};

