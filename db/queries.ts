import { cache } from "react";
import db from "@/db/drizzle";
import { questionProgress, sublevels } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

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
      if(
        sub.questions.length ===0
      ){
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
      sublevel: sublevelWithCompletedStatus, // overwrite the original
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
        return !question.questionProgress || question.questionProgress.length == 0 || question.questionProgress.some((progress) => progress.completed === false);
      })
    })

    return {
      activeSublevel: firstUncompletedSublevel,
      activeSublevelId: firstUncompletedSublevel?.id,
    }
});


export const getSublevel = cache(async (id?:number) => {
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
        },
      },
    },
  });

  if(!data || !data.questions) {
    return null;
  }

  const normalizedQuestions = data.questions.map((question) => {
    const completed = question.questionProgress && question.questionProgress.length > 0 && question.questionProgress.every((progress) => progress.completed);

    return { ...question, completed};
  })

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
})

