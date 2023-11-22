import { useQueryClient } from "@tanstack/react-query";
import { MessageInterface } from "../types/Message";
import { User } from "../types/User";
import { Box, useTheme, Typography } from "@mui/material";
import formatCustomDate from "../utils/formatDate";

function Message({ message }: { message: MessageInterface }) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const user: User = queryClient.getQueryData(["userData"])!;
  const selectedUser: User = queryClient.getQueryData(["databaseUserData"])!;

  return (
    <Box
      sx={{
        maxWidth: "70%",
        ml: `${message.sender === user._id ? "auto" : "0"}`,
        mr: `${message.sender === selectedUser._id ? "auto" : "0"}`,
        mb: 2,
      }}
    >
      <Box
        sx={{
          borderRadius: 7,
          backgroundColor: `${
            message.sender === user._id ? theme.deepBlue : "white"
          }`,
          color: `${message.sender === user._id ? "white" : "black"}`,
          py: 2,
          px: 3,
          boxShadow: 5,
          ml: `${message.sender === user._id ? "auto" : "0"}`,
          mr: `${message.sender === selectedUser._id ? "auto" : "0"}`,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {message.content}
        </Typography>
      </Box>
      <Typography sx={{ color: "rgba(0, 0, 0, 0.6)", textAlign: "right" }}>
        {formatCustomDate(message.createdAt)}
      </Typography>
    </Box>
  );
}

export default Message;
