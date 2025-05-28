// app/sublevel/layout.tsx
import React from "react";

type Props = { children: React.ReactNode };

export default function SublevelLayout({ children }: Props) {
  return (
    // full-screen gradient background, flex-centered
    <div
      className="
        min-h-screen 
        bg-gradient-to-br from-sky-50 to-white 
        flex items-center justify-center
      "
    >
      {/* 
        Default (mobile):
          w-full, h-full, plain bg-white 
        md+ (tablet/laptop): 
          max-w-xl, auto-height, rounded corners, shadow, extra padding 
      */}
      <div
        className="
          bg-white
          w-full h-full
          p-4
          md:max-w-xl md:h-auto md:rounded-2xl md:shadow-xl md:p-6
        "
      >
        {children}
      </div>
    </div>
  );
}


