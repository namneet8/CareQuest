export const Footer = () => {
    return (
        <footer className="hidden lg:block h-10 w-full border-t-2 border-slate-200 p-2 bg-white">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between h-full text-sm">
                <div className="text-slate-500 text-center w-full">
                    <span className="sr-only">Copyright</span>
                    &copy; {new Date().getFullYear()}{' '}
                    <a 
                        href="/" 
                        className="hover:text-slate-700 transition-colors font-medium"
                    >
                        CareQuest
                    </a>
                    . All rights reserved.
                </div>
                <div className="flex space-x-4">
                    <a href="/privacy" className="text-slate-500 hover:text-slate-700">
                        Privacy
                    </a>
                    <a href="/terms" className="text-slate-500 hover:text-slate-700">
                        Terms
                    </a>
                </div> 
            </div>
        </footer>
    );
};