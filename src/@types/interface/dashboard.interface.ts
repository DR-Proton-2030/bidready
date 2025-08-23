export interface DashboardStat {
  id: number;
  title: string;
  value: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface RecentActivity {
  id: number;
  message: string;
  time: string;
  borderColor: string;
}
