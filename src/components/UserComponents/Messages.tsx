import { MessagesResponse } from "../types/Message";
import Message from "./Message";
import { Box } from "@mui/material";

function Messages({ group }: { group: MessagesResponse }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        overflowY: "auto",
        flex: 1,
      }}
    >
      {group.data.map((message) => (
        <Message message={message} key={message._id} />
      ))}
    </Box>
  );
}

export default Messages;
