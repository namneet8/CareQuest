import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import { getFormProgress, getLevels, getSublevelPercentage } from "@/db/queries";
import { Level } from "./level";
import { redirect } from "next/navigation";

const FormPage = async () => {

    const levelsData = getLevels();
    const formProgressData = getFormProgress();
    const sublevelPercentageData = getSublevelPercentage();

    const [levels, formProgress, sublevelPercentage ] = await Promise.all([levelsData, formProgressData, sublevelPercentageData, ])

    if (!formProgress){
        redirect("/");
    }

    return(
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress activeLevel={{ title: "Basic"}} hearts={5} points={100} hasActiveSubscription={false}/>
            </StickyWrapper>
            <FeedWrapper>
                <Header title="RoadMap" />
                {levels.map((level) => (
                    <div key={level.id} className="mb-10 ">
                        <Level 
                            id={level.id}
                            order={level.order}
                            description={level.description}
                            title={level.title}
                            sublevel={level.sublevel}
                            activeSublevel={formProgress.activeSublevel}
                            activeSublevelPercentage={sublevelPercentage}
                        />
                    </div>
                ))}
            </FeedWrapper>
        </div>
    );
}

export default FormPage;