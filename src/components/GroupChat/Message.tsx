import { useQueryClient } from "@tanstack/react-query";
import { GroupMessageInterface } from "../types/Message";
import { User } from "../types/User";
import {
  Box,
  useTheme,
  Typography,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import formatCustomDate from "../utils/formatDate";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

function Message({ message }: { message: GroupMessageInterface }) {
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
      if (res.status !== 204) {
        setOpen(true);
      }
    } catch (err) {
      setOpen(true);
    }
  }
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          An error occurred during while deleting message. Please try again
          later.
        </Alert>
      </Snackbar>
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
                  color: `${
                    message.sender._id === user._id ? "white" : "black"
                  }`,
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
      </Box>
    </>
  );
}

export default Message;
