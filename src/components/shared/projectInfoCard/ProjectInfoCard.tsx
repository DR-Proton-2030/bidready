import React from "react";

interface ProjectInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor?: string;
  iconColor?: string;
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  icon,
  label,
  value,
  bgColor = "bg-gray-50",
  iconColor = "text-gray-600"
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoCard;
