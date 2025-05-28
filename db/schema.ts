import { UniqueConstraint } from "drizzle-orm/gel-core";
import { pgTable, text, pgEnum, integer, serial, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/logo.svg"),
  points: integer("points").notNull().default(0),
});

export const levels = pgTable("levels", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(), //Level 1
    description: text("description").notNull(), //Basic Information
    order: integer("order").notNull(),
});

export const levelsRelations = relations(levels, ({many, one}) => ({
    sublevel: many(sublevels),
}))

export const sublevels = pgTable("sublevels", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    levelId: integer("level_id").references(() => levels.id, {onDelete: "cascade"}).notNull(),
    order: integer("order").notNull(),
});

export const sublevelsRelations = relations(sublevels, ({one, many}) => ({
    level: one(levels, {
        fields: [sublevels.levelId],
        references: [levels.id]
    }),
    questions: many(questions),
}))

export const questionsEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    sublevelId: integer("sublevel_id").references(() => sublevels.id, {onDelete: "cascade"}).notNull(),
    type: questionsEnum("type").notNull(),
    questionText: text("question_text").notNull(),
    order: integer("order").notNull(),
})

export const questionsRelations = relations(questions, ({one, many}) => ({
    sublevel: one(sublevels, {
        fields: [questions.sublevelId],
        references: [sublevels.id]
    }),
    questionOptions: many(questionOptions),
    questionProgress: many(questionProgress),
}))

export const questionOptions = pgTable("questionOptions", {
    id: serial("id").primaryKey(),
    questionId: integer("question_id").references(() => questions.id, {onDelete: "cascade"}).notNull(),
    text: text("text").notNull(),
    order: integer("order").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio.src"),
})

export const questionOptionsRelations = relations(questionOptions, ({one}) => ({
    question: one(questions, {
        fields: [questionOptions.questionId],
        references: [questions.id]
    })
}))

export const questionProgress = pgTable("questionProgress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    questionId: integer("question_id").references(() => questions.id, {onDelete: "cascade"}).notNull(),
    completed: boolean("completed").notNull().default(false),
})

export const questionProgressRelations = relations(questionProgress, ({one}) => ({
    question: one(questions, {
        fields: [questionProgress.questionId],
        references: [questions.id]
    })
}))


