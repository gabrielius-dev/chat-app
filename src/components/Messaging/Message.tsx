import { useQueryClient } from "@tanstack/react-query";
import { MessageInterface } from "../types/Message";
import { User } from "../types/User";
import { Box, useTheme, Typography, IconButton } from "@mui/material";
import formatCustomDate from "../utils/formatDate";
import { useState } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import axios, { AxiosResponse } from "axios";
import socket from "../../socket/socket";
import AlertNotification from "../UtilityComponents/AlertNotification";

function Message({
  message,
  messages,
}: {
  message: MessageInterface;
  messages: MessageInterface[];
}) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const user: User = queryClient.getQueryData(["userData"])!;
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);

  async function deleteMessage() {
    try {
      const res: AxiosResponse = await axios.delete(
        `http://localhost:8000/message/${message._id}`,
        { withCredentials: true }
      );
      if (res.status === 204) {
        let latestMessage;

        if (messages.indexOf(message) === messages.length - 1) {
          latestMessage = messages[messages.length - 2];
        } else {
          latestMessage = messages[messages.length - 1];
        }

        socket.emit("delete-message", message, latestMessage);
      }

      if (res.status !== 204) setOpen(true);
    } catch (err) {
      setOpen(true);
    }
  }

  return (
    <>
      {open && (
        <AlertNotification
          message="An error occurred during while deleting message. Please try again
          later."
          type="error"
          open={open}
          setOpen={setOpen}
        />
      )}
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          maxWidth: "70%",
          ml: `${message.sender._id === user._id ? "auto" : "0"}`,
          mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: `${message.sender._id === user._id ? "auto" : "0"}`,
              mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
            }}
          >
            {message.sender._id === user._id && (
              <IconButton
                sx={{
                  visibility: isHovered ? "visible" : "hidden",
                  transition: "opacity 0.5s",
                  opacity: isHovered ? 1 : 0,
                }}
                onClick={() => void deleteMessage()}
              >
                <DeleteRoundedIcon />
              </IconButton>
            )}

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
    </>
  );
}

export default Message;
