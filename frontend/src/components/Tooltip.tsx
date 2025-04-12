"use client";

import { useState, ReactNode } from 'react';

type TooltipProps = {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes based on placement
  const tooltipClass = `absolute z-10 bg-darkGray text-white text-sm px-3 py-2 rounded-md shadow-lg transition-opacity duration-200 whitespace-nowrap ${
    isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
  } ${
    position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' :
    position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' :
    position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' :
    'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }`;

  // Arrow position classes
  const arrowClass = `absolute h-2 w-2 bg-darkGray transform rotate-45 ${
    position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
    position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
    position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
    'right-full top-1/2 -translate-y-1/2 -mr-1'
  }`;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <div className={tooltipClass}>
        {text}
        <div className={arrowClass}></div>
      </div>
    </div>
  );
} 