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
  mood?: string;
  moodDescription?: string;
  status?: "home" | "away" | "unreachable" | "unavailable";
  statusDescription?: string;
  statusDistance?: number;
};
