import { useQueryClient } from "@tanstack/react-query";
import { GroupMessageInterface } from "../types/Message";
import { User } from "../types/User";
import { Box, useTheme, Typography, Avatar } from "@mui/material";
import formatCustomDate from "../utils/formatDate";
import { Link } from "react-router-dom";

function Message({ message }: { message: GroupMessageInterface }) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const user: User = queryClient.getQueryData(["userData"])!;

  return (
    <Box
      sx={{
        maxWidth: "70%",
        ml: `${message.sender._id === user._id ? "auto" : "0"}`,
        mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {message.sender._id !== user._id && (
          <Link to={`/user/${message.sender._id}`}>
            <Avatar
              alt="Profile picture"
              src={message.sender?.img}
              sx={{
                width: 50,
                height: 50,
                bgcolor: theme.midnightNavy,
              }}
            >
              {!message.sender?.img
                ? message.sender.username[0].toUpperCase()
                : null}
            </Avatar>
          </Link>
        )}

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              borderRadius: 7,
              backgroundColor: `${
                message.sender._id === user._id ? theme.deepBlue : "white"
              }`,
              color: `${message.sender._id === user._id ? "white" : "black"}`,
              py: 2,
              px: 3,
              boxShadow: 5,
              ml: `${message.sender._id === user._id ? "auto" : "0"}`,
              mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
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
              ml: `${message.sender._id === user._id ? "auto" : "0"}`,
              mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
            }}
          >
            {formatCustomDate(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Message;
