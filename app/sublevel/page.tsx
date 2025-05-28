import { redirect } from "next/navigation";
import { getSublevel} from "@/db/queries";
import { Ques } from "./ques";

const SublevelPage = async () => {
    const sublevelData = getSublevel();

    const [sublevel, ] = await Promise.all([ sublevelData, ]);

    if(!sublevel) {
        redirect("/form");
    }

    const initialPercentage = sublevel.questions
        .filter((question) => question.completed)
        .length / sublevel.questions.length * 100;

    return(
        <Ques 
            initialSublevelId={sublevel.id}
            initialSublevelQuestions = {sublevel.questions}
            //initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            
        />
    )
}

export default SublevelPage;