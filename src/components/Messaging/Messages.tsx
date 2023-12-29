import { Dispatch, SetStateAction, useMemo, memo } from "react";
import { MessageInterface } from "../types/Message";
import Message from "./Message";

type setMessagesType = Dispatch<SetStateAction<MessageInterface[]>>;

const Messages = memo(function Messages({
  messages,
  messagesEndRef,
  messagesContainerRef,
  handleScroll,
  setMessages,
}: {
  messages: MessageInterface[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  setMessages: setMessagesType;
}) {
  const memoizedMessages = useMemo(
    () =>
      messages.map((message) => (
        <Message
          message={message}
          key={message._id}
          setMessages={setMessages}
          messages={messages}
        />
      )),
    [messages, setMessages]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        overflowY: "auto",
        flex: 1,
      }}
      onScroll={handleScroll}
      ref={messagesContainerRef}
    >
      {memoizedMessages.length > 0 && memoizedMessages}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default Messages;
