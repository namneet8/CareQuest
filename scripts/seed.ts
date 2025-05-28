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
    ]);

    // Insert sublevels
    const sublevels = [
      "Personal Information",
      "Medical History",
      "Family Background",
      "Current Condition",
      "Dietary",
    ];

    const allSublevels = sublevels.map((title, index) => ({
      id: index + 1,
      levelId: 1,
      title,
      order: index + 1,
    }));

    await db.insert(schema.sublevels).values(allSublevels);

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
    ];

    await db.insert(schema.questionOptions).values(options);

    console.log("✅ Seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
};

main();
