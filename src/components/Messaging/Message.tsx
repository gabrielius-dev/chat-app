import { useQueryClient } from "@tanstack/react-query";
import { MessageInterface } from "../types/Message";
import { User } from "../types/User";
import { Box, useTheme, Typography } from "@mui/material";
import formatCustomDate from "../utils/formatDate";

function Message({ message }: { message: MessageInterface }) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const user: User = queryClient.getQueryData(["userData"])!;

  return (
    <Box
      sx={{
        maxWidth: "70%",
        ml: `${message.sender === user._id ? "auto" : "0"}`,
        mr: `${message.sender !== user._id ? "auto" : "0"}`,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
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
            mr: `${message.sender !== user._id ? "auto" : "0"}`,
            maxWidth: "max-content",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-line",
            }}
          >
            {message.content}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: "rgba(0, 0, 0, 0.6)",
            ml: `${message.sender === user._id ? "auto" : "0"}`,
            mr: `${message.sender !== user._id ? "auto" : "0"}`,
          }}
        >
          {formatCustomDate(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}

export default Message;
