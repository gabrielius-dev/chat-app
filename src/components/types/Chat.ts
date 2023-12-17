import { MessageInterface } from "./Message";
import { User } from "./User";

export interface Chat extends User {
  latestMessage: MessageInterface;
}

export interface GroupChat {
  _id: string;
  name: string;
  image?: string;
  users: User[];
  latestMessage: MessageInterface;
}

interface GroupChatWithoutLatestMessage {
  _id: string;
  name: string;
  users: User[];
  image?: string;
}

export interface GroupChatResponse {
  success: boolean;
  message: string;
  group: GroupChatWithoutLatestMessage;
}
