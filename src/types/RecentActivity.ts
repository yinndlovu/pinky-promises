export type RecentActivityItem = {
  id: string;
  description: string;
  date: string;
  time: string;
};

export type RecentActivityProps = {
  activities: RecentActivityItem[];
};
