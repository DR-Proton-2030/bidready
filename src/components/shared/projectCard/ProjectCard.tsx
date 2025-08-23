import React from 'react';
import { FolderOpen, Calendar, Users } from 'lucide-react';
import { Project } from '@/@types/interface/project.interface';

interface ProjectCardProps extends Project {
  onClick?: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  status,
  lastUpdated,
  members,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {lastUpdated}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {members} members
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
