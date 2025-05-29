"use client";

import React, { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const HospitalDoodleBackground = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const timer = setInterval(() => {
      setTime(prev => prev + 0.01);
    }, 16);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  interface DoodleIconProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    interactive?: boolean;
    id?: string | null;
    floating?: boolean;
  }

  const DoodleIcon = ({ children, className = "", delay = 0, interactive = false, id = null, floating = false }: DoodleIconProps) => (
    <div
      className={`
        absolute transition-all duration-300 ease-out pointer-events-auto
        ${interactive ? 'hover:scale-110 cursor-pointer' : ''}
        ${hoveredElement === id ? 'scale-125 z-[2]' : 'z-[1]'}
        ${floating ? 'animate-bounce' : ''}
        ${className}
      `}
      style={{
        transform: floating 
          ? `translateY(${Math.sin(time + delay) * 10}px) translateX(${Math.cos(time * 0.5 + delay) * 5}px)`
          : undefined,
        animationDelay: `${delay}s`
      }}
      onMouseEnter={() => interactive && setHoveredElement(id)}
      onMouseLeave={() => interactive && setHoveredElement(null)}
    >
      {children}
    </div>
  );

  interface HospitalBuildingProps {
    size?: number;
    color?: string;
  }

  const HospitalBuilding = ({ size = 120, color = "#ff6b9d" }: HospitalBuildingProps) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="20" y="30" width="80" height="70" fill={color} stroke="white" strokeWidth="3" rx="8"/>
      <polygon points="15,30 60,10 105,30" fill={color} opacity="0.7"/>
      <rect x="30" y="45" width="12" height="15" fill="white" opacity="0.8" rx="2"/>
      <rect x="45" y="45" width="12" height="15" fill="white" opacity="0.8" rx="2"/>
      <rect x="63" y="45" width="12" height="15" fill="white" opacity="0.8" rx="2"/>
      <rect x="78" y="45" width="12" height="15" fill="white" opacity="0.8" rx="2"/>
      <rect x="55" y="70" width="10" height="4" fill="white"/>
      <rect x="58" y="67" width="4" height="10" fill="white"/>
      <rect x="55" y="85" width="10" height="15" fill="white" opacity="0.9" rx="2"/>
    </svg>
  );

  const Ambulance = ({ size = 80 }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 80 48" fill="none">
      <rect x="5" y="15" width="60" height="20" fill="#ffffff" opacity="0.9" rx="3"/>
      <rect x="5" y="15" width="60" height="8" fill="#ff6b9d" opacity="0.8" rx="3"/>
      <rect x="35" y="20" width="8" height="2" fill="#ff0000"/>
      <rect x="38" y="17" width="2" height="8" fill="#ff0000"/>
      <circle cx="20" cy="38" r="4" fill="#333" opacity="0.7"/>
      <circle cx="50" cy="38" r="4" fill="#333" opacity="0.7"/>
      <rect x="50" y="18" width="12" height="8" fill="#87ceeb" opacity="0.6" rx="1"/>
      <circle cx="65" cy="22" r="2" fill="#ffd93d" opacity="0.8"/>
    </svg>
  );

  interface StethoscopeProps {
    size?: number;
    color?: string;
  }

  const Stethoscope = ({ size = 40, color = "#ff9a9e" }: StethoscopeProps) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M8 12c0 3 2 5 4 6l2 8c0 2-1 4-3 4s-3-2-3-4" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M32 12c0 3-2 5-4 6l-2 8c0 2 1 4 3 4s3-2 3-4" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="20" cy="32" r="4" fill={color} opacity="0.7"/>
      <path d="M14 26c2 2 4 4 6 6c2-2 4-4 6-6" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="20" cy="32" r="2" fill="white" opacity="0.7"/>
    </svg>
  );

  interface PillProps {
    size?: number;
    colors?: [string, string];
  }

  const Pill = ({ size = 30, colors = ["#a8e6cf", "#ffd93d"] }: PillProps) => (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <path d="M7 15c0-4 4-8 8-8v16c-4 0-8-4-8-8z" fill={colors[0]} opacity="0.8"/>
      <path d="M23 15c0 4-4 8-8 8V7c4 0 8 4 8 8z" fill={colors[1]} opacity="0.8"/>
      <ellipse cx="15" cy="15" rx="8" ry="8" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
    </svg>
  );

  interface SyringeProps {
    size?: number;
    color?: string;
  }

  const Syringe = ({ size = 35, color = "#ffb3ba" }: SyringeProps) => (
    <svg width={size} height={size} viewBox="0 0 35 35" fill="none">
      <rect x="5" y="10" width="20" height="8" fill={color} opacity="0.9" rx="2"/>
      <rect x="25" y="13" width="8" height="2" fill="#c0c0c0" opacity="0.8"/>
      <circle cx="3" cy="14" r="2" fill={color} opacity="0.7"/>
      <line x1="12" y1="12" x2="12" y2="16" stroke="white" strokeWidth="0.5"/>
      <line x1="16" y1="12" x2="16" y2="16" stroke="white" strokeWidth="0.5"/>
      <line x1="20" y1="12" x2="20" y2="16" stroke="white" strokeWidth="0.5"/>
    </svg>
  );

  interface ThermometerProps {
    size?: number;
    color?: string;
  }

  const Thermometer = ({ size = 25, color = "#ff6b9d" }: ThermometerProps) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <rect x="10" y="2" width="5" height="18" fill={color} opacity="0.8" rx="2"/>
      <circle cx="12.5" cy="20" r="3" fill={color} opacity="0.9"/>
      <rect x="11" y="5" width="3" height="12" fill="white" opacity="0.6"/>
    </svg>
  );

  interface MedicalPatternProps {
    x: string;
    y: string;
    rotation?: number;
  }

  const MedicalPattern = ({ x, y, rotation = 0 }: MedicalPatternProps) => (
    <div 
      className="absolute opacity-20 pointer-events-none z-[0]" 
      style={{ 
        left: x, 
        top: y, 
        transform: `rotate(${rotation}deg)` 
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path d="M20 5v30M5 20h30" stroke="#a8e6cf" strokeWidth="1" opacity="0.3"/>
        <circle cx="20" cy="20" r="8" stroke="#ffd93d" strokeWidth="1" fill="none" opacity="0.2"/>
      </svg>
    </div>
  );

  interface DoodleHeartProps {
    size?: number;
    color?: string;
    beat?: boolean;
  }

  const DoodleHeart = ({ size = 25, color = "#ff6b9d", beat = true }: DoodleHeartProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 25 25" 
      className={beat ? 'animate-pulse' : ''}
    >
      <path 
        d="M12.5 21c-1.5-1.3-6-5.3-6-8.5 0-2.5 2-4.5 4.5-4.5 1.3 0 2.5 0.6 3.5 1.5 1-0.9 2.2-1.5 3.5-1.5 2.5 0 4.5 2 4.5 4.5 0 3.2-4.5 7.2-6 8.5z" 
        fill={color} 
        opacity="0.8"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden lg:left-[256px]">
      {/* Floating Medical Icons */}
      <DoodleIcon className="top-12 left-12" delay={0} floating interactive id="hospital1">
        <HospitalBuilding color="#ff6b9d" />
      </DoodleIcon>

      <DoodleIcon className="top-1/4 right-20" delay={1.5} floating interactive id="stethoscope1">
        <Stethoscope color="#4ecdc4" />
      </DoodleIcon>

      <DoodleIcon className="bottom-32 left-20" delay={2.1} floating interactive id="pill1">
        <Pill colors={["#a8e6cf", "#ffd93d"]} />
      </DoodleIcon>

      <DoodleIcon className="top-1/3 left-1/4" delay={0.8} floating interactive id="syringe1">
        <Syringe color="#ffb3ba" />
      </DoodleIcon>

      <DoodleIcon className="bottom-20 right-32" delay={1.2} floating interactive id="thermometer1">
        <Thermometer color="#ff9a9e" />
      </DoodleIcon>

      <DoodleIcon className="top-20 right-1/3" delay={2.5} floating interactive id="heart1">
        <DoodleHeart color="#ff6b9d" beat />
      </DoodleIcon>

      <DoodleIcon className="bottom-1/4 left-1/3" delay={1.8} floating interactive id="hospital2">
        <HospitalBuilding color="#4ecdc4" size={100} />
      </DoodleIcon>

      {/* Static Background Patterns */}
      <MedicalPattern x="5%" y="60%" rotation={15} />
      <MedicalPattern x="80%" y="30%" rotation={-20} />
      <MedicalPattern x="60%" y="70%" rotation={45} />
      <MedicalPattern x="25%" y="15%" rotation={-10} />
      <MedicalPattern x="85%" y="80%" rotation={30} />

      {/* More Floating Elements */}
      <DoodleIcon className="top-1/2 right-12" delay={3.2} floating interactive id="pill2">
        <Pill colors={["#ffb3ba", "#4ecdc4"]} />
      </DoodleIcon>

      <DoodleIcon className="top-3/4 left-1/2" delay={0.5} floating interactive id="stethoscope2">
        <Stethoscope color="#ffd93d" size={35} />
      </DoodleIcon>

      <DoodleIcon className="bottom-12 right-1/4" delay={2.8} floating interactive id="heart2">
        <DoodleHeart color="#4ecdc4" size={20} beat />
      </DoodleIcon>

      <DoodleIcon className="top-40 left-2/3" delay={1.1} floating interactive id="syringe2">
        <Syringe color="#a8e6cf" size={30} />
      </DoodleIcon>

      {/* Ambulance */}
      <DoodleIcon className="bottom-1/3 right-20" delay={4.0} floating interactive id="ambulance1">
        <Ambulance size={100} />
      </DoodleIcon>

      {/* Mouse follower effect */}
      {mousePosition.x > 0 && (
        <div
          className="absolute transition-all duration-1000 ease-out opacity-30 pointer-events-none z-[1]"
          style={{
            left: mousePosition.x - 15,
            top: mousePosition.y - 15,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <DoodleHeart color="#ff6b9d" size={30} beat />
        </div>
      )}
    </div>
  );
};

export default HospitalDoodleBackground;