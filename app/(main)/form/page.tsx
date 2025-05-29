import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import { getFormProgress, getLevels, getSublevelPercentage, getUserProgress } from "@/db/queries";
import { Level } from "./level";
import { redirect } from "next/navigation";

const FormPage = async () => {

    const levelsData = getLevels();
    const formProgressData = getFormProgress();
    const sublevelPercentageData = getSublevelPercentage();
    const userProgressData = getUserProgress();

    const [levels, formProgress, sublevelPercentage, userProgressInfo ] = await Promise.all([
        levelsData, 
        formProgressData, 
        sublevelPercentageData,
        userProgressData
    ]);

    if (!formProgress){
        redirect("/");
    }

    // Default values if user progress doesn't exist yet
    const points = userProgressInfo?.points ?? 0;
    const spins = userProgressInfo?.spins ?? 0;

    return(
        <div className="z-10 flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress 
                    activeLevel={{ title: "Basic"}} 
                    spins={spins} 
                    points={points} 
                    hasActiveSubscription={false}
                />
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