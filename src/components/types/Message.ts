export interface MessageInterface {
  _id: string;
  message: string;
  createdAt: string;
  sender: string;
  receiver: string;
}

export interface MessagesResponse {
  data: MessageInterface[];
  skipAmount: number;
}
