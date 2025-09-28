export type AlertType = "info" | "success" | "error";

export type AlertModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  onClose: () => void;
};
