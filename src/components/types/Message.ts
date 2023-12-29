import { User } from "./User";

export interface MessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface SenderInterface {
  _id: string;
  img?: string;
  username: string;
}

export interface GroupMessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: SenderInterface;
  receiver: string;
}
