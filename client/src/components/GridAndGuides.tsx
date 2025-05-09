import React, { useState, useEffect } from 'react';

interface GridAndGuidesProps {
  width: number;
  height: number;
  showGrid: boolean;
  mousePosition: { x: number, y: number } | null;
}

const GridAndGuides: React.FC<GridAndGuidesProps> = ({
  width,
  height,
  showGrid,
  mousePosition
}) => {
  const gridSize = 25; // Size of grid cells in pixels
  
  // Calculate grid lines
  const horizontalLines = [];
  const verticalLines = [];
  
  if (showGrid) {
    for (let i = gridSize; i < width; i += gridSize) {
      verticalLines.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={height}
          stroke="#ddd"
          strokeWidth={i % 100 === 0 ? 0.5 : 0.2}
          strokeDasharray={i % 100 === 0 ? "" : "2,2"}
        />
      );
    }
    
    for (let i = gridSize; i < height; i += gridSize) {
      horizontalLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i}
          x2={width}
          y2={i}
          stroke="#ddd"
          strokeWidth={i % 100 === 0 ? 0.5 : 0.2}
          strokeDasharray={i % 100 === 0 ? "" : "2,2"}
        />
      );
    }
  }
  
  // Ruler markers
  const rulerMarkers = [];
  
  if (showGrid) {
    // Horizontal ruler markers (top)
    for (let i = 0; i < width; i += gridSize) {
      if (i % 100 === 0) {
        rulerMarkers.push(
          <text
            key={`marker-top-${i}`}
            x={i + 2}
            y={12}
            fontSize="10"
            fill="#888"
          >
            {i}
          </text>
        );
      }
    }
    
    // Vertical ruler markers (left)
    for (let i = 0; i < height; i += gridSize) {
      if (i % 100 === 0) {
        rulerMarkers.push(
          <text
            key={`marker-left-${i}`}
            x={2}
            y={i + 12}
            fontSize="10"
            fill="#888"
          >
            {i}
          </text>
        );
      }
    }
  }
  
  // Mouse position guides
  const mouseGuides = [];
  
  if (mousePosition) {
    // Horizontal guide at mouse position
    mouseGuides.push(
      <line
        key="mouse-h"
        x1={0}
        y1={mousePosition.y}
        x2={width}
        y2={mousePosition.y}
        stroke="rgba(59, 130, 246, 0.5)"  // Primary color with transparency
        strokeWidth={1}
      />
    );
    
    // Vertical guide at mouse position
    mouseGuides.push(
      <line
        key="mouse-v"
        x1={mousePosition.x}
        y1={0}
        x2={mousePosition.x}
        y2={height}
        stroke="rgba(59, 130, 246, 0.5)"  // Primary color with transparency
        strokeWidth={1}
      />
    );
    
    // Mouse position label
    mouseGuides.push(
      <g key="mouse-label">
        <rect
          x={mousePosition.x + 10}
          y={mousePosition.y + 10}
          width={80}
          height={20}
          fill="rgba(59, 130, 246, 0.9)"
          rx={4}
        />
        <text
          x={mousePosition.x + 20}
          y={mousePosition.y + 24}
          fontSize="12"
          fill="white"
        >
          {`X: ${Math.round(mousePosition.x)}, Y: ${Math.round(mousePosition.y)}`}
        </text>
      </g>
    );
  }
  
  return (
    <>
      {/* Horizontal Ruler */}
      <div className="absolute top-0 left-0 h-5 w-full bg-gray-100 z-10" />
      
      {/* Vertical Ruler */}
      <div className="absolute top-0 left-0 h-full w-5 bg-gray-100 z-10" />
      
      {/* Grid and Guides SVG overlay */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ overflow: 'visible' }}
      >
        {/* Ruler backgrounds */}
        <rect x="0" y="0" width={width} height="20" fill="#f3f4f6" />
        <rect x="0" y="0" width="20" height={height} fill="#f3f4f6" />
        
        {/* Grid lines */}
        {horizontalLines}
        {verticalLines}
        
        {/* Ruler markers */}
        {rulerMarkers}
        
        {/* Mouse guides */}
        {mouseGuides}
      </svg>
    </>
  );
};

export default GridAndGuides;