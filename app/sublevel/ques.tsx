"use client";

import { questionOptions, questions } from "@/db/schema";
import { useState } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Question } from "./question";

type Props = {
    initialPercentage: number,
    initialSublevelId: number,
    initialSublevelQuestions: (typeof questions.$inferSelect & {
        completed: boolean;
        questionOptions: typeof questionOptions.$inferSelect[];
    })[];

}

export const Ques = ({
    initialPercentage,
    initialSublevelId,
    initialSublevelQuestions,
}: Props) => {

    const [percentage, setpercentage] = useState(initialPercentage);
    const [questions] = useState(initialSublevelQuestions);
    const [activeIndex, setActiveIndex] = useState (() => {
        const uncompletedIndex = questions.findIndex((question) => !question.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });
    const question = questions[activeIndex];
    const options = question?.questionOptions ?? [];
    const title = question.type === "ASSIST" ? "Select the Option that suits you the best." : question.questionText;

    return(
        <>
            <Header percentage={percentage}/>
            <div className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                            {title}
                        </h1>
                        <div>
                            {question.type === "ASSIST" && (
                                <QuestionBubble question={question.questionText}/>
                            )}
                            <Question 
                                options={options}
                                onSelect={() => {}}
                                //status= "none"
                                selectedOption={undefined}
                                disabled={false}
                                type={question.type}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}