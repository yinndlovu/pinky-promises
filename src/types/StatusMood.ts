export type StatusMoodProps = {
  onAddHome?: () => void;
  mood?: string;
  moodDescription?: string;
  onEdit?: () => void;
  status?: "home" | "away" | "unreachable" | "unavailable";
  statusDescription?: string;
  statusDistance?: number;
};

export type PartnerStatusMoodProps = {
  partnerId: string;
  partnerName: string;
  refreshKey?: number;
};
