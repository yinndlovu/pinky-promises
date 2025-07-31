export type Memory = {
  id: string;
  memory: string;
  date: string;
  author: string | null;
  userId: string;
};

export type FavoriteMemoryProps = {
  memories: Memory[];
  currentUserId: string;
  onViewAll?: () => void;
  onViewDetails?: (memoryId: string) => void;
  onAdd?: () => void;
  onEdit?: (memory: Memory) => void;
  onDelete?: (memory: Memory) => void;
};