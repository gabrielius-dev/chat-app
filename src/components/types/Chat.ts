import { GroupMessageInterface, MessageInterface } from "./Message";
import { User } from "./User";

export interface Chat extends User {
  latestMessage: MessageInterface;
}

export interface GroupChat {
  _id: string;
  name: string;
  image?: string;
  users: User[];
  createdAt: string;
  latestMessage: GroupMessageInterface;
}

export interface GroupChatWithoutLatestMessage {
  _id: string;
  name: string;
  image?: string;
  users: User[];
  createdAt: string;
}

export interface GroupChatResponse {
  success: string;
  groupChat: GroupChatWithoutLatestMessage;
  message: string;
}
