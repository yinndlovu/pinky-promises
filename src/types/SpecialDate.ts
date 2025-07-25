export type AnniversaryProps = {
  anniversaryDate?: string;
  dayMet?: string;
  onEditAnniversary?: () => void;
  onEditDayMet?: () => void;
};

export type SpecialDate = {
  id: string;
  date: string;
  title: string;
  description?: string;
  togetherFor?: string;
  knownFor?: string;
  nextAnniversaryIn?: string;
  nextMetDayIn?: string;
};
