export interface Canvas {
  id: number;
  title: string;
  content: string;
  userId: number;
  partnerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasPreviewProps {
  canvases: Canvas[];
  onExpand: () => void;
  onCanvasPress: (canvas: Canvas) => void;
  onAddCanvas: () => void;
  loading?: boolean;
}

