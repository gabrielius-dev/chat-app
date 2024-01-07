import { useMemo, memo, Fragment } from "react";
import { GroupMessageInterface } from "../types/Message";
import Message from "./Message";
import LoadingMessage from "../UtilityComponents/LoadingMessage";

const Messages = memo(function Messages({
  messages,
  messagesEndRef,
  messagesContainerRef,
  handleScroll,
}: {
  messages: GroupMessageInterface[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}) {
  const memoizedMessages = useMemo(
    () =>
      messages.map((message) => (
        <Fragment key={message._id}>
          {message.sendingIndicatorId !== message._id && (
            <Message message={message} messages={messages} />
          )}
          {message.sendingIndicatorId === message._id && (
            <LoadingMessage
              createdAt={message.createdAt}
              imagesCount={message.images?.[0].width ?? 1}
            />
          )}
        </Fragment>
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
