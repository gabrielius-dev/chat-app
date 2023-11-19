export interface MessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: string;
  receiver: string;
}

export interface MessagesResponse {
  data: MessageInterface[];
  skipAmount: number;
}
