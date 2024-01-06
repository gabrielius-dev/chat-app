import { User } from "./User";

export interface MessageInterface {
  _id: string;
  content?: string;
  createdAt: string;
  sender: User;
  receiver: User;
  images?: Image[];
  sendingIndicatorId?: string;
}

interface Image {
  width: number;
  height: number;
  url: string;
}

interface SenderInterface {
  _id: string;
  img?: string;
  username: string;
}

export interface GroupMessageInterface {
  _id: string;
  content?: string;
  createdAt: string;
  sender: SenderInterface;
  receiver: string;
  images?: Image[];
  sendingIndicatorId?: string;
}
