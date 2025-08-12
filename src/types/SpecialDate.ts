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

export type SpecialDateType = {
  id: string;
  title: string;
  date: string;
  description: string;
  extra?: { [key: string]: string };
};

export type SpecialDateProps = {
  dates: SpecialDateType[];
  onAdd: () => void;
  onLongPressDate?: (date: any) => void;
};
