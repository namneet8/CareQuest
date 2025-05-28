import "dotenv/config"
import {drizzle} from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, {schema});
const main = async () => {
    try{
        console.log("Seeding database");

        await db.delete(schema.userProgress);
        await db.delete(schema.levels);
        await db.delete(schema.sublevels);
        await db.delete(schema.questions);
        await db.delete(schema.questionOptions);
        await db.delete(schema.questionProgress);

        await db.insert(schema.levels).values([
            {
                id: 1,
                title: "Level 1",
                description: "Basic Health Card",
                order: 1
            }
        ]);

        await db.insert(schema.sublevels).values([
            {
                id: 1,
                levelId: 1,
                title: "Personal Information",
                order: 1
            },
            {
                id: 2,
                levelId: 1,
                title: "Medical History",
                order: 2
            },
            {
                id: 3,
                levelId: 1,
                title: "Family Background",
                order: 3
            },
            {
                id: 4,
                levelId: 1,
                title: "Current Condition",
                order: 4
            },
            {
                id: 5,
                levelId: 1,
                title: "Dietary",
                order: 5
            },
        ]);

        await db.insert(schema.questions).values([
            {
                id: 1,
                sublevelId: 1,
                type: "SELECT",
                questionText: "What is you Gender?",
                order: 1
            },
            {
                id: 2,
                sublevelId: 2,
                type: "SELECT",
                questionText: "Have you been diagonized with any chronic disease?",
                order: 1
            },
            
        ]);

        await db.insert(schema.questionOptions).values([
            {
                id: 1,
                questionId: 1,
                text: "Male",
                order: 1
            },
            {
                id: 2,
                questionId: 1,
                text: "Female",
                order: 2
            },
            {
                id: 3,
                questionId: 1,
                text: "Other",
                order: 3
            },
            
        ]);

        console.log("Seeding finished");
    } catch(error){
        console.error(error);
        throw new Error ("Failed to seed the database");

    }
};

main();