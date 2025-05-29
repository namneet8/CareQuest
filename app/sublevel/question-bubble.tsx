import Image from "next/image";
import { useState, useEffect } from "react";

type Props = {
    question: string;
}

export const QuestionBubble = ({ question }: Props) => {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        setAnimationKey(prev => prev + 1);
    }, [question]);

    return (
        <div className="flex items-center gap-x-0 mb-6">
            <Image 
                src="/doctorTeddy.gif"
                alt="Mascot"
                height={120}
                width={120}
                className="hidden lg:block"
            />
            <Image 
                src="/doctorTeddy.gif"
                alt="Mascot"
                height={120}
                width={120}
                className="block lg:hidden"
            />
            <div className="relative py-2 px-4 border-2 rounded-xl text-sm lg:text-base">
                <style jsx>{`
                    .typewriter {
                        display: inline-block;
                        overflow: hidden;
                        white-space: nowrap;
                        border-right: 2px solid currentColor;
                        animation: typing 2s steps(${question.length}, end), blink-caret 0.75s step-end infinite;
                    }
                    @keyframes typing {
                        from { width: 0; }
                        to { width: 100%; }
                    }
                    @keyframes blink-caret {
                        from, to { border-color: transparent; }
                        50% { border-color: currentColor; }
                    }
                `}</style>
                <span key={animationKey} className="typewriter">{question}</span>
                <div className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90"/>
            </div>
        </div>
    )
}