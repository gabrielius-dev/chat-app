import { Dispatch, SetStateAction } from "react";
import { GroupMessageInterface, MessageInterface } from "./Message";
import { User } from "./User";

export interface Chat extends User {
  latestMessage: MessageInterface;
}

export interface GroupChat extends GroupChatWithoutLatestMessage {
  latestMessage: GroupMessageInterface;
}

export interface GroupChatWithoutLatestMessage {
  _id: string;
  name: string;
  image: string | null;
  users: string[];
  createdAt: string;
  creator: string;
}

export interface GroupChatResponse {
  success: string;
  groupChat: GroupChatWithoutLatestMessage;
  message: string;
}

export interface ChatContextProps {
  chatList: Chat[];
  setChatList: Dispatch<SetStateAction<Chat[]>>;
  groupChatList: GroupChat[];
  setGroupChatList: Dispatch<SetStateAction<GroupChat[]>>;
}
