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
            <div className="relative inline-block border-2 rounded-xl text-sm lg:text-base">
                <style jsx>{`
                    .bubble {
                        display: inline-block;
                        overflow: hidden;
                        white-space: nowrap;
                        animation: expand 2s steps(${question.length}, end) forwards;
                    }
                    .typewriter {
                        display: inline-block;
                        overflow: hidden;
                        white-space: nowrap;
                        direction: rtl;
                        text-align: right;
                        border-left: 2px solid currentColor;
                        animation: typing 2s steps(${question.length}, end), blink-caret 0.75s step-end infinite;
                        padding: 0.5rem 1rem; /* Restore padding inside the text */
                    }
                    @keyframes expand {
                        from { width: 0; }
                        to { width: calc(${question.length} * 0.6rem + 2rem); } /* Approximate width based on character count */
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
                <div key={animationKey} className="bubble">
                    <span className="typewriter">{question}</span>
                </div>
                <div className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90"/>
            </div>
        </div>
    )
}