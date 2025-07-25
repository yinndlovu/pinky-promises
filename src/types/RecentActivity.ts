export type RecentActivity = {
  id: string;
  description: string;
  date: string;
  time: string;
};

export type RecentActivityProps = {
  activities: RecentActivity[];
};
