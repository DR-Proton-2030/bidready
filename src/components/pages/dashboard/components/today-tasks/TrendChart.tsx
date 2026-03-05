import React from "react";

// Constants for layout
const W = 800;
const H = 300;
const lineX = 310;       // dashed vertical line
const startX = 62;       // x where y-axis labels end
const PILL_X = 562;      // left edge of pills
const PILL_W = 182;
const PILL_H = 44;

interface ProjectTrend {
  label: string;
  value: number;
}

interface TrendChartProps {
  title?: string;
  projects?: ProjectTrend[];
}

export default function TrendChart({ 
  title = "New Request Trend",
  projects = []
}: TrendChartProps) {
  // Use a max of 5 projects to keep the chart readable
  const displayProjects = projects.length > 0 ? projects.slice(0, 5) : [
    { label: "Development", value: 0 },
    { label: "Investment", value: 0 },
    { label: "Build and Hold", value: 0 }
  ];
  
  // Calculate vertical spacing based on number of projects
  // We want to distribute them within the Y-range [50, 260]
  const minY = 50;
  const maxY = 260;
  const getY = (index: number) => {
    if (displayProjects.length <= 1) return (minY + maxY) / 2;
    return minY + (index * (maxY - minY)) / (displayProjects.length - 1);
  };

  // The "main" curve always hits 210 at lineX for the indicator badge
  const indicatorY = 210;

  return (
    <div style={{
      background: "white",
      borderRadius: 24,
      padding: "24px 0 28px 0",
      maxWidth: 720,
    //   boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingLeft: 20, paddingRight: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 19, color: "#111", letterSpacing: "-0.3px" }}>{title}</span>
        <button style={{
          width: 38, height: 38, borderRadius: "50%", background: "#F0F3F6",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#9CA3AF",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", overflow: "visible" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8DC87A" />
              <stop offset="28%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="glowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
            <filter id="curveShadow" x="-5%" y="-30%" width="110%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#F97316" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 60, 120, 180, 240, 300].map((y, i) => (
            <line key={i} x1={startX} y1={y} x2={PILL_X - 4} y2={y} stroke="#EDF1F5" strokeWidth="1.2" />
          ))}

          {/* Y-axis labels */}
          {[["100", 4], ["80", 64], ["60", 124], ["40", 184], ["20", 244], ["0", 298]].map(([label, y]) => (
            <text key={label as string} x={startX - 8} y={y as number} textAnchor="end" fontSize="24" fontWeight="700" fill="#B8C7D0" fontFamily="'Segoe UI', sans-serif">
              {label as string}
            </text>
          ))}

          {/* Curves */}
          {displayProjects.map((project, i) => {
            const endY = getY(i);
            const isFirst = i === 0;
            // Adaptive curve paths starting from different points but using the same S-shape logic
            const currentStartY = H - 40 - (i * 12);
            const path = `M ${startX},${currentStartY} C ${startX + 100},${currentStartY} ${lineX - 30},${currentStartY} ${lineX},${isFirst ? indicatorY : currentStartY - 5} C ${lineX + 80},${isFirst ? indicatorY : currentStartY - 5} ${lineX + 130},${endY + 20} ${PILL_X},${endY}`;
            
            return (
              <React.Fragment key={project.label}>
                {isFirst && <path d={`${path} L ${PILL_X},${H} L ${startX},${H} Z`} fill="url(#glowFill)" />}
                <path 
                  d={path} 
                  fill="none" 
                  stroke={isFirst ? "url(#orangeGrad)" : (i % 2 === 0 ? "#BACDD6" : "#A5BAC5")} 
                  strokeWidth={isFirst ? 6 : 5} 
                  strokeLinecap="round" 
                  filter={isFirst ? "url(#curveShadow)" : "none"} 
                />
              </React.Fragment>
            );
          })}

          {/* Vertical indicator line and arrows */}
          <line x1={lineX} y1="18" x2={lineX} y2={H - 18} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
          <polygon points={`${lineX - 9},0 ${lineX + 9},0 ${lineX},18`} fill="#111" />
          <polygon points={`${lineX - 9},${H} ${lineX + 9},${H} ${lineX},${H - 18}`} fill="#111" />
          
          {/* Main Circle - anchored to indicatorY */}
          <circle cx={lineX} cy={indicatorY} r="14" fill="white" stroke="#F97316" strokeWidth="3.5" />

          {/* Dynamic Pills */}
          {displayProjects.map((project, i) => {
            const y = getY(i);
            const isFirst = i === 0;
            
            return (
              <foreignObject key={project.label} x={PILL_X} y={y - PILL_H / 2} width={PILL_W} height={PILL_H}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  background: isFirst ? "linear-gradient(130deg, #FF8235, #EF4444)" : (i % 2 === 0 ? "#BACDD6" : "#A5BAC5"),
                  color: "white", borderRadius: 999,
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700,
                  padding: "0 12px",
                  textAlign: "center",
                  lineHeight: "1.1",
                  boxShadow: isFirst ? "0 4px 18px rgba(239,68,68,0.35)" : "none",
                  fontFamily: "'Segoe UI', sans-serif",
                  boxSizing: "border-box",
                }}>{project.label}</div>
              </foreignObject>
            );
          })}
        </svg>

        {/* Badge - anchored to indicatorY */}
        {/* <div style={{
          position: "absolute",
          left: `calc(${(lineX / W) * 100}% - 68px)`,
          top: `${(indicatorY / H) * 60}%`,
          transform: "translateY(-50%)",
          background: "#111",
          color: "white",
          borderRadius: 999,
          padding: "5px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
          pointerEvents: "none",
          zIndex: 20,
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "-0.5px" }}>37</span>
          <span style={{ fontSize: 7, fontWeight: 800, color: "#4ADE80" }}>+1.2%</span>
        </div> */}
      </div>
    </div>
  );
}
