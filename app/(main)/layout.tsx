import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import HospitalDoodleBackground from "@/components/hospital-doodle-background";

type Props = {
    children: React.ReactNode;
};

const MainLayout = ({children, }: Props) => {
    return(
        <>
            <MobileHeader />
            <Sidebar className="hidden lg:flex"/>
            <main className="lg:pl-[256px] h-full pt-[40px] lg:pt-0 relative">
                {/* Move background HERE - inside main content area only */}
                {/* <HospitalDoodleBackground /> */}
                <div className="max-w-[1056px] mx-auto pt-5 h-full relative z-10">
                    {children}
                </div>
            </main>
        </>
    );
}

export default MainLayout;