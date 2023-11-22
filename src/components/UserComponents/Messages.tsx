import { MessageInterface } from "../types/Message";
import Message from "./Message";
function Messages({
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
      {messages.length > 0 &&
        messages.map((message) => (
          <Message message={message} key={message._id} />
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Messages;
