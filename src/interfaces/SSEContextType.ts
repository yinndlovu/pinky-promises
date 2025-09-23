export interface SSEContextType {
  isConnected: boolean;
  reconnect: () => void;
}
