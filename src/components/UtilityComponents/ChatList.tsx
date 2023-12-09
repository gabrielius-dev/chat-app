import axios, { AxiosResponse } from "axios";
import { useEffect, useState, memo, useContext, useCallback } from "react";
import { User } from "../types/User";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  useTheme,
  Button,
  Box,
  CircularProgress,
  Badge,
  styled,
} from "@mui/material";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../../socket/socket";
import { Chat } from "../types/Message";
import WindowFocusContext from "../../context/WindowsFocusContext";

const MemoizedListItem = memo(function MemoizedListItem({
  chatListItem,
  user,
}: {
  chatListItem: Chat;
  user: User;
}) {
  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: chatListItem.online ? "#44b700" : "#888888",
      color: chatListItem.online ? "#44b700" : "#888888",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));

  const theme = useTheme();
  return (
    <Link to={`/messages/${chatListItem._id}`}>
      <ListItem disablePadding>
        <ListItemButton sx={{ display: "flex", gap: 1 }}>
          <ListItemAvatar>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt="Profile picture"
                src={chatListItem?.img}
                sx={{ width: 40, height: 40, bgcolor: theme.deepBlue }}
              >
                {!chatListItem?.img
                  ? chatListItem?.username[0].toUpperCase()
                  : null}
              </Avatar>
            </StyledBadge>
          </ListItemAvatar>
          <ListItemText
            sx={{ wordBreak: "break-word" }}
            primary={chatListItem.username}
            secondary={
              chatListItem.latestMessage
                ? `${
                    chatListItem.latestMessage?.sender === user._id
                      ? "You: "
                      : ""
                  }${
                    chatListItem.latestMessage?.content?.length > 15
                      ? chatListItem.latestMessage.content.slice(0, 15) + "..."
                      : chatListItem.latestMessage.content
                  }`
                : `Say hi to ${chatListItem.username}!`
            }
          />
          {chatListItem.latestMessage?.createdAt && (
            <TimeAgo
              key={chatListItem.latestMessage?.createdAt}
              date={chatListItem.latestMessage?.createdAt}
              minPeriod={10}
              style={{ color: "rgba(0, 0, 0, 0.6)" }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Link>
  );
});

const ChatList = memo(function ChatList() {
  const theme = useTheme();
  const [chatList, setChatList] = useState<Chat[] | []>([]);
  const [loadOffset, setLoadOffset] = useState(1);
  const [moreChatsExist, setMoreChatsExist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const isWindowFocused = useContext(WindowFocusContext);

  const chatListFetching = useCallback(async () => {
    const response: AxiosResponse<Chat[]> = await axios.get(
      "http://localhost:8000/chatList",
      {
        params: { loadOffset },

        withCredentials: true,
      }
    );
    if (response.data.length < 10 * loadOffset) setMoreChatsExist(false);
    return response.data;
  }, [loadOffset]);

  useEffect(() => {
    setIsLoading(true);

    chatListFetching()
      .then((res) => {
        setChatList(res);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, [chatListFetching]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWindowFocused) {
      intervalId = setInterval(() => {
        chatListFetching()
          .then((res) => {
            setChatList(res);
            setIsLoading(false);
          })
          .catch((err) => console.error(err));
      }, 60000);
    } else {
      clearInterval(intervalId!);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [chatListFetching, isWindowFocused]);

  useEffect(() => {
    socket.emit("join-room", user._id);

    function getNewChatHandler(returnedChat: Chat) {
      setChatList((prevChatList) =>
        prevChatList
          .map((chat) => {
            if (chat._id === returnedChat._id) {
              return returnedChat;
            }
            return chat;
          })
          .sort((a, b) => {
            const aCreatedAt =
              a.latestMessage?.createdAt ?? "0000-00-00T00:00:00.000Z";
            const bCreatedAt =
              b.latestMessage?.createdAt ?? "0000-00-00T00:00:00.000Z";
            return bCreatedAt.localeCompare(aCreatedAt);
          })
      );
    }

    socket.on("get-new-chat", getNewChatHandler);

    return () => {
      socket.off("get-chat-list", getNewChatHandler);
    };
  }, [user._id]);

  const loadMoreUsers = () =>
    setLoadOffset((currentLoadOffset) => currentLoadOffset + 1);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        alignItems: "center",
      }}
    >
      <List sx={{ width: "100%", bgcolor: "background.paper", pt: 0 }}>
        {chatList.map((chatListItem) => (
          <MemoizedListItem
            key={chatListItem._id}
            chatListItem={chatListItem}
            user={user}
          />
        ))}
      </List>
      {isLoading && <CircularProgress sx={{ color: theme.deepBlue }} />}
      {!isLoading && moreChatsExist && (
        <Button
          variant="outlined"
          sx={{
            color: theme.deepBlue,
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              border: 2,
            },
            borderRadius: 1,
            border: 2,
            marginX: 1,
          }}
          onClick={loadMoreUsers}
        >
          Load more
        </Button>
      )}
    </Box>
  );
});

export default ChatList;
