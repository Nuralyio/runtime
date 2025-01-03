export interface Message {
  sender: string;
  text: string;
  timestamp: string;
  error?: boolean;
  introduction?: boolean;
}
