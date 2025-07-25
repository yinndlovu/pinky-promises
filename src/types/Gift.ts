export type PastGift = {
  id: string;
  giftName: string;
  receivedAt: string;
  claimedAt: string;
};

export type PastGiftProps = {
  gifts: PastGift[];
};

export type ReceivedGiftProps = {
  giftName: string;
  receivedAt: string;
  onClaim?: () => void;
  claiming?: boolean;
};

export type SetMonthlyGiftProps = {
  giftName: string;
  onChange?: () => void;
  buttonText?: string;
};