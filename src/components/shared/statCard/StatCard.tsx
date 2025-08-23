import React from 'react';
import { DashboardStat } from '@/@types/interface/dashboard.interface';

interface StatCardProps extends DashboardStat {}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  textColor
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );
};

export default StatCard;
