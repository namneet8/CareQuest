import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Define valid enum values for TypeScript
const VALID_QUESTION_TYPES = [
  "SELECT",
  "FILL",
  "RATE",
  "TEXT",
  "ASSIST",
  "MULTI_SELECT",
  "DATE",
  "YES_NO",
  "RANGE"
] as const;

type QuestionType = typeof VALID_QUESTION_TYPES[number];

const main = async () => {
  try {
    console.log("Seeding database");

    // Clean all tables
    await db.delete(schema.userResponses);
    await db.delete(schema.questionProgress);
    await db.delete(schema.questionOptions);
    await db.delete(schema.questions);
    await db.delete(schema.sublevels);
    await db.delete(schema.levels);
    await db.delete(schema.userProgress);

    // Insert levels
    await db.insert(schema.levels).values([
      {
        id: 1,
        title: "Level 1",
        description: "Basic Health Card",
        order: 1,
      },
      {
        id: 2,
        title: "Level 2",
        description: "Intermediate Health Card",
        order: 2,
      },
      {
        id: 3,
        title: "Level 3",
        description: "Advanced Health Card",
        order: 3,
      },
    ]);

    // Insert sublevels
 const sublevels = [
      { id: 1, levelId: 1, title: "Personal Information", order: 1 },
      { id: 2, levelId: 1, title: "Medical History", order: 2 },
      { id: 3, levelId: 1, title: "Family Background", order: 3 },
      { id: 4, levelId: 1, title: "Current Condition", order: 4 },
      { id: 5, levelId: 1, title: "Dietary", order: 5 },
      { id: 6, levelId: 2, title: "Exercise Routine", order: 1 },
      { id: 7, levelId: 2, title: "Sleep Patterns", order: 2 },
      { id: 8, levelId: 2, title: "Mental Health", order: 3 },
      { id: 9, levelId: 2, title: "Health Goals", order: 4 },
      { id: 10, levelId: 2, title: "Substance Use", order: 5 },
      { id: 11, levelId: 3, title: "Vaccination Records", order: 1 },
      { id: 12, levelId: 3, title: "Hospital Visits", order: 2 },
      { id: 13, levelId: 3, title: "Surgical History", order: 3 },
      { id: 14, levelId: 3, title: "Allergies", order: 4 },
      { id: 15, levelId: 3, title: "Advanced Directives", order: 5 },
    ];
await db.insert(schema.sublevels).values(sublevels);

    // Insert questions
    const questions: {
      id: number;
      sublevelId: number;
      type: QuestionType;
      questionText: string;
      order: number;
      mandatory: boolean;
      importanceDescription: string;
      parentQuestionId?: number;
    }[] = [
      { id: 1, sublevelId: 1, type: "SELECT", questionText: "What is your Gender?", order: 1, mandatory: true, importanceDescription: "Gender helps customize your treatment plan." },
      { id: 2, sublevelId: 1, type: "FILL", questionText: "What is your full name?", order: 2, mandatory: true, importanceDescription: "We need your full name for identification." },
      { id: 3, sublevelId: 1, type: "DATE", questionText: "What is your date of birth?", order: 3, mandatory: true, importanceDescription: "Your age helps determine suitable treatment." },
      { id: 4, sublevelId: 1, type: "YES_NO", questionText: "Do you have a family doctor?", order: 4, mandatory: false, importanceDescription: "This helps us coordinate your care." },
      { id: 5, sublevelId: 2, type: "YES_NO", questionText: "Have you been diagnosed with any chronic disease?", order: 1, mandatory: false, importanceDescription: "Helps tailor your treatment." },
      { id: 6, sublevelId: 2, type: "FILL", questionText: "List any chronic diseases.", order: 2, mandatory: false, importanceDescription: "We will use this to personalize your plan.", parentQuestionId: 5 },
      { id: 7, sublevelId: 2, type: "RATE", questionText: "Rate your overall health.", order: 3, mandatory: true, importanceDescription: "Self-rated health provides context for decisions." },
      { id: 8, sublevelId: 2, type: "SELECT", questionText: "How often do you see a doctor?", order: 4, mandatory: true, importanceDescription: "Frequency of visits helps gauge engagement." },
      { id: 9, sublevelId: 3, type: "YES_NO", questionText: "Does anyone in your family have heart disease?", order: 1, mandatory: true, importanceDescription: "Family history affects your risk." },
      { id: 10, sublevelId: 3, type: "FILL", questionText: "Specify the relationship.", order: 2, mandatory: false, importanceDescription: "We’ll use this to assess risk.", parentQuestionId: 9 },
      { id: 11, sublevelId: 3, type: "YES_NO", questionText: "Is there a history of diabetes?", order: 3, mandatory: false, importanceDescription: "Important for preventative steps." },
      { id: 12, sublevelId: 3, type: "TEXT", questionText: "Any other hereditary conditions?", order: 4, mandatory: false, importanceDescription: "We want to understand your background." },
      { id: 13, sublevelId: 4, type: "SELECT", questionText: "Are you currently on medication?", order: 1, mandatory: true, importanceDescription: "Medications can affect new prescriptions." },
      { id: 14, sublevelId: 4, type: "FILL", questionText: "List your current medications.", order: 2, mandatory: false, importanceDescription: "Medication list helps avoid conflicts.", parentQuestionId: 13 },
      { id: 15, sublevelId: 4, type: "RATE", questionText: "Rate your current stress level.", order: 3, mandatory: false, importanceDescription: "Mental health is part of overall health." },
      { id: 16, sublevelId: 4, type: "YES_NO", questionText: "Do you have any pain right now?", order: 4, mandatory: true, importanceDescription: "Pain information helps assess urgency." },
      { id: 17, sublevelId: 5, type: "YES_NO", questionText: "Are you on a special diet?", order: 1, mandatory: true, importanceDescription: "We need to know dietary restrictions." },
      { id: 18, sublevelId: 5, type: "FILL", questionText: "What kind of diet?", order: 2, mandatory: false, importanceDescription: "Details help with nutritional planning.", parentQuestionId: 17 },
      { id: 19, sublevelId: 5, type: "SELECT", questionText: "How many meals do you eat per day?", order: 3, mandatory: true, importanceDescription: "Regular meals are important for balance." },
      { id: 20, sublevelId: 5, type: "TEXT", questionText: "Any food allergies or intolerances?", order: 4, mandatory: false, importanceDescription: "Essential for avoiding harmful foods." },
      { id: 21, sublevelId: 6, type: "SELECT", questionText: "Which blood pressure strategy did you choose?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 22, sublevelId: 6, type: "YES_NO", questionText: "Have you set weight management goals?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 23, sublevelId: 6, type: "SELECT", questionText: "Which dietary advice have you adopted?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 24, sublevelId: 7, type: "SELECT", questionText: "What type of physical activity did you implement?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 25, sublevelId: 7, type: "SELECT", questionText: "How often do you engage in physical activity?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 26, sublevelId: 7, type: "YES_NO", questionText: "Have you tracked your activity in the app?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 27, sublevelId: 8, type: "SELECT", questionText: "Do you regularly practice stress-relief techniques?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 28, sublevelId: 8, type: "SELECT", questionText: "How many hours of sleep do you typically get?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 29, sublevelId: 8, type: "YES_NO", questionText: "Have you applied sleep improvement tips?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 30, sublevelId: 9, type: "YES_NO", questionText: "Have you scheduled suggested lab work?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 31, sublevelId: 9, type: "YES_NO", questionText: "Have you input lab results into the app?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 32, sublevelId: 9, type: "SELECT", questionText: "Were your lab results normal?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 33, sublevelId: 10, type: "SELECT", questionText: "Are you up to date on vaccinations?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 34, sublevelId: 10, type: "YES_NO", questionText: "Do you know when your next booster is due?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 35, sublevelId: 10, type: "YES_NO", questionText: "Have you logged vaccination history?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 36, sublevelId: 11, type: "YES_NO", questionText: "Have you completed the Happiness Scale questionnaire?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 37, sublevelId: 11, type: "SELECT", questionText: "Do social connections positively impact your goals?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 38, sublevelId: 11, type: "YES_NO", questionText: "Have you set social goals in the app?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 39, sublevelId: 12, type: "YES_NO", questionText: "Have you completed your CVD risk assessment?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 40, sublevelId: 12, type: "YES_NO", questionText: "Have you assessed your diabetes risk?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 41, sublevelId: 12, type: "SELECT", questionText: "Were risk reports useful?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 42, sublevelId: 13, type: "SELECT", questionText: "Which of the following core values resonate most with you?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 43, sublevelId: 13, type: "SELECT", questionText: "Which type of goal-setting do you find most effective?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 44, sublevelId: 13, type: "SELECT", questionText: "How frequently do you set and review personal goals?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 45, sublevelId: 14, type: "SELECT", questionText: "Participating in HEAT Ambassador activities?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 46, sublevelId: 14, type: "YES_NO", questionText: "Chosen a global/social project?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 47, sublevelId: 14, type: "SELECT", questionText: "Completed behavioral challenges?", order: 3, mandatory: true, importanceDescription: "" },
      { id: 48, sublevelId: 15, type: "SELECT", questionText: "Satisfied with the HEAT app overall?", order: 1, mandatory: true, importanceDescription: "" },
      { id: 49, sublevelId: 15, type: "SELECT", questionText: "Recommend HEAT to others?", order: 2, mandatory: true, importanceDescription: "" },
      { id: 50, sublevelId: 15, type: "YES_NO", questionText: "Suggestions to improve HEAT app?", order: 3, mandatory: true, importanceDescription: "" }
    ];

    await db.insert(schema.questions).values(questions);

    // Insert options
    const options = [
      { id: 101, questionId: 1, text: "Male", order: 1 },
      { id: 102, questionId: 1, text: "Female", order: 2 },
      { id: 103, questionId: 1, text: "Other", order: 3 },
      { id: 104, questionId: 8, text: "Rarely", order: 1 },
      { id: 105, questionId: 8, text: "Sometimes", order: 2 },
      { id: 106, questionId: 8, text: "Frequently", order: 3 },
      { id: 107, questionId: 13, text: "Yes", order: 1 },
      { id: 108, questionId: 13, text: "No", order: 2 },
      { id: 109, questionId: 19, text: "1", order: 1 },
      { id: 110, questionId: 19, text: "2", order: 2 },
      { id: 111, questionId: 19, text: "3+", order: 3 },
      { id: 112, questionId: 21, text: "Low-Sodium Diet", order: 1 },
      { id: 113, questionId: 21, text: "Medication", order: 2 },
      { id: 114, questionId: 23, text: "Low Carb", order: 1 },
      { id: 115, questionId: 23, text: "Mediterranean", order: 2 },
      { id: 116, questionId: 24, text: "Walking", order: 1 },
      { id: 117, questionId: 24, text: "Cycling", order: 2 },
      { id: 118, questionId: 25, text: "Daily", order: 1 },
      { id: 119, questionId: 25, text: "Weekly", order: 2 },
      { id: 120, questionId: 27, text: "Meditation", order: 1 },
      { id: 121, questionId: 27, text: "Yoga", order: 2 },
      { id: 122, questionId: 28, text: "<5 hours", order: 1 },
      { id: 123, questionId: 28, text: "5-7 hours", order: 2 },
      { id: 124, questionId: 28, text: ">7 hours", order: 3 },
      { id: 125, questionId: 32, text: "Yes", order: 1 },
      { id: 126, questionId: 32, text: "No", order: 2 },
      { id: 127, questionId: 33, text: "Yes", order: 1 },
      { id: 128, questionId: 33, text: "No", order: 2 },
      { id: 129, questionId: 37, text: "Yes", order: 1 },
      { id: 130, questionId: 37, text: "No", order: 2 },
      { id: 131, questionId: 41, text: "Very Useful", order: 1 },
      { id: 132, questionId: 41, text: "Somewhat Useful", order: 2 },
      { id: 133, questionId: 41, text: "Not Useful", order: 3 },
      { id: 134, questionId: 42, text: "Integrity", order: 1 },
      { id: 135, questionId: 42, text: "Compassion", order: 2 },
      { id: 136, questionId: 43, text: "SMART Goals", order: 1 },
      { id: 137, questionId: 43, text: "Vision Boards", order: 2 },
      { id: 138, questionId: 44, text: "Weekly", order: 1 },
      { id: 139, questionId: 44, text: "Monthly", order: 2 },
      { id: 140, questionId: 45, text: "Yes", order: 1 },
      { id: 141, questionId: 45, text: "No", order: 2 },
      { id: 142, questionId: 47, text: "Yes", order: 1 },
      { id: 143, questionId: 47, text: "No", order: 2 },
      { id: 144, questionId: 48, text: "Yes", order: 1 },
      { id: 145, questionId: 48, text: "No", order: 2 },
      { id: 146, questionId: 49, text: "Yes", order: 1 },
      { id: 147, questionId: 49, text: "No", order: 2 }
    ];

    await db.insert(schema.questionOptions).values(options);

    console.log("✅ Seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
};

main();
