import { useMemo, memo } from "react";
import { MessageInterface } from "../types/Message";
import Message from "./Message";

const Messages = memo(function Messages({
  messages,
  messagesEndRef,
  messagesContainerRef,
  handleScroll,
}: {
  messages: MessageInterface[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}) {
  const memoizedMessages = useMemo(
    () =>
      messages.map((message) => (
        <Message message={message} key={message._id} />
      )),
    [messages]
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
