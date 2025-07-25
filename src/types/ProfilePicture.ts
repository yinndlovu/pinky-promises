export type ProfilePictureViewerProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
};

export type ProfilePictureInfo = {
  [userId: string]: {
    uri: string;
    updatedAt: Date;
  };
};