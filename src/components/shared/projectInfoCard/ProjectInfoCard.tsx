import React from "react";

interface ProjectInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor?: string;
  iconColor?: string;
  gradient?: string;
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  icon,
  label,
  value,
  bgColor = "bg-gray-50",
  iconColor = "text-gray-600",
  gradient,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden">
      {/* Subtle gradient background on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient || 'bg-gradient-to-br from-gray-50 to-white'}`}></div>

      <div className="relative flex items-center gap-4">
        {/* Icon with gradient background */}
        <div className={`relative p-3 rounded-xl ${bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <div className={`${iconColor} group-hover:scale-105 transition-transform duration-200`}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-base font-bold text-gray-900 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoCard;

