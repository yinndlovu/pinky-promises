export type PendingRequest = {
  id: string;
  sender: {
    id: string;
    username: string;
  } | null;
  status: string;
  createdAt: string;
};
