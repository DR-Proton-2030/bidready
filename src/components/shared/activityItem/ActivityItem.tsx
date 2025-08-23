import React from 'react';
import { RecentActivity } from '@/@types/interface/dashboard.interface';

interface ActivityItemProps extends RecentActivity {}

const ActivityItem: React.FC<ActivityItemProps> = ({
  message,
  time,
  borderColor
}) => {
  return (
    <div className={`border-l-4 ${borderColor} pl-4`}>
      <p className="text-gray-700">{message}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  );
};

export default ActivityItem;
