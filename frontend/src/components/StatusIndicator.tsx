"use client";

import React from 'react';

type StatusType = 'success' | 'pending' | 'error' | 'info';

type StatusIndicatorProps = {
  status: StatusType;
  text: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function StatusIndicator({ 
  status, 
  text, 
  showDot = true,
  size = 'md',
  className = ''
}: StatusIndicatorProps) {
  // Colors based on status type
  const colors = {
    success: {
      bg: 'bg-green-DEFAULT',
      text: 'text-black',
      dot: 'bg-black'
    },
    pending: {
      bg: 'bg-yellow',
      text: 'text-black',
      dot: 'bg-black'
    },
    error: {
      bg: 'bg-red',
      text: 'text-white',
      dot: 'bg-white'
    },
    info: {
      bg: 'bg-blue-DEFAULT',
      text: 'text-white',
      dot: 'bg-white'
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${colors[status].bg} ${colors[status].text} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span 
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${colors[status].dot}`} 
          aria-hidden="true"
        />
      )}
      {text}
    </span>
  );
} 