import React from 'react';

interface PlaceholderImageProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
  text?: string;
}

export function PlaceholderImage({ 
  className = '', 
  width = '100%', 
  height = '100%', 
  color = 'bg-gradient-to-br from-blue-500 to-purple-600',
  text = ''
}: PlaceholderImageProps) {
  return (
    <div 
      className={`relative ${color} flex items-center justify-center overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {text && (
        <span className="text-white font-medium text-sm px-2 py-1">{text}</span>
      )}
    </div>
  );
}
