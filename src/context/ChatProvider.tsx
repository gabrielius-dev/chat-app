import { FC, ReactNode, createContext, useState } from "react";
import { Chat, ChatContextProps, GroupChat } from "../components/types/Chat";

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [groupChatList, setGroupChatList] = useState<GroupChat[]>([]);

  return (
    <ChatContext.Provider
      value={{ chatList, setChatList, groupChatList, setGroupChatList }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
