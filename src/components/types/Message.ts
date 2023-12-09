import { User } from "./User";

export interface MessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: string;
  receiver: string;
}

export interface Chat extends User {
  latestMessage: MessageInterface;
}
