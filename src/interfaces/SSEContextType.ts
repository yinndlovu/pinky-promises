export interface SSEContextType {
  isConnected: boolean;
  reconnect: () => void;
  wasBackgrounded: boolean;
  refetchCriticalData: () => Promise<void>;
}
