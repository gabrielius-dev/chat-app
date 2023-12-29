import { useContext } from "react";
import { ChatContextProps } from "../components/types/Chat";
import ChatContext from "./ChatProvider";

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }

  return context;
};
