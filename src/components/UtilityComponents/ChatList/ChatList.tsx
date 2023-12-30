import axios, { AxiosResponse } from "axios";
import { useEffect, useState, memo, useContext, useCallback } from "react";
import { User } from "../../types/User";
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
  Typography,
} from "@mui/material";
import TimeAgo from "react-timeago";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../../../socket/socket";
import {
  Chat,
  GroupChat,
  GroupChatWithoutLatestMessage,
} from "../../types/Chat";
import WindowFocusContext from "../../../context/WindowsFocusContext";
import CreateGroupForm from "./CreateGroupForm";
import { formatDateString } from "../../utils/formatDate";
import { useChatContext } from "../../../context/useChatContext";
import { GroupMessageInterface, MessageInterface } from "../../types/Message";
import AlertSuccess from "../AlertSuccess";

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
                sx={{ width: 40, height: 40, bgcolor: theme.midnightNavy }}
              >
                {!chatListItem?.img
                  ? chatListItem?.username[0].toUpperCase()
                  : null}
              </Avatar>
            </StyledBadge>
          </ListItemAvatar>
          <ListItemText
            sx={{ wordBreak: "break-word", maxWidth: "60%" }}
            primary={chatListItem.username}
            secondary={
              chatListItem.latestMessage
                ? `${
                    chatListItem.latestMessage?.sender._id === user._id
                      ? "You: "
                      : ""
                  }${
                    chatListItem.latestMessage?.content?.length > 15
                      ? chatListItem.latestMessage.content.slice(0, 15) + "..."
                      : chatListItem.latestMessage.content
                  }`
                : "Start with a greeting!"
            }
          />
          {chatListItem.latestMessage?.createdAt && (
            <TimeAgo
              key={chatListItem.latestMessage?.createdAt}
              date={chatListItem.latestMessage?.createdAt}
              minPeriod={10}
              style={{ color: "rgba(0, 0, 0, 0.6)", marginLeft: "auto" }}
              title={formatDateString(chatListItem.latestMessage?.createdAt)}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Link>
  );
});

const MemoizedGroupListItem = memo(function MemoizedListItem({
  chatListItem,
  user,
}: {
  chatListItem: GroupChat;
  user: User;
}) {
  const theme = useTheme();
  return (
    <Link to={`/group-chat/${chatListItem._id}`}>
      <ListItem disablePadding>
        <ListItemButton sx={{ display: "flex", gap: 1 }}>
          <ListItemAvatar>
            <Avatar
              alt="Profile picture"
              src={chatListItem.image ?? undefined}
              sx={{ width: 40, height: 40, bgcolor: theme.midnightNavy }}
            >
              {!chatListItem?.image
                ? chatListItem?.name[0].toUpperCase()
                : null}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            sx={{ wordBreak: "break-word", maxWidth: "60%" }}
            primary={chatListItem.name}
            secondary={
              chatListItem.latestMessage
                ? `${
                    chatListItem.latestMessage?.sender._id === user._id
                      ? "You: "
                      : `${chatListItem.latestMessage?.sender.username}: `
                  }${
                    chatListItem.latestMessage?.content?.length > 15
                      ? chatListItem.latestMessage.content.slice(0, 15) + "..."
                      : chatListItem.latestMessage.content
                  }`
                : "Say hello to the group!"
            }
          />
          {chatListItem.latestMessage?.createdAt && (
            <TimeAgo
              key={chatListItem.latestMessage?.createdAt}
              date={chatListItem.latestMessage?.createdAt}
              minPeriod={10}
              style={{ color: "rgba(0, 0, 0, 0.6)", marginLeft: "auto" }}
              title={formatDateString(chatListItem.latestMessage?.createdAt)}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Link>
  );
});

const ChatList = memo(function ChatList() {
  const theme = useTheme();
  const { chatList, setChatList, groupChatList, setGroupChatList } =
    useChatContext();
  const [loadOffset, setLoadOffset] = useState(1);
  const [groupLoadOffset, setGroupLoadOffset] = useState(1);
  const [moreChatsExist, setMoreChatsExist] = useState(true);
  const [moreGroupChatsExist, setMoreGroupChatsExist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGroupChats, setIsLoadingGroupChats] = useState(false);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const isWindowFocused = useContext(WindowFocusContext);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());
  const [openAlertSuccess, setOpenAlertSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const chatListFetching = useCallback(async () => {
    const response: AxiosResponse<Chat[]> = await axios.get(
      "http://localhost:8000/chat-list",
      {
        params: { loadOffset },

        withCredentials: true,
      }
    );
    if (response.data.length < 10 * loadOffset) setMoreChatsExist(false);

    return response.data;
  }, [loadOffset]);

  const groupChatListFetching = useCallback(async () => {
    const response: AxiosResponse<GroupChat[]> = await axios.get(
      "http://localhost:8000/group-chat-list",
      {
        params: { loadOffset: groupLoadOffset },

        withCredentials: true,
      }
    );
    if (response.data.length < 5 * groupLoadOffset)
      setMoreGroupChatsExist(false);

    return response.data;
  }, [groupLoadOffset]);

  useEffect(() => {
    setIsLoadingGroupChats(true);

    groupChatListFetching()
      .then((res) => {
        setGroupChatList(res);
        setIsLoadingGroupChats(false);
      })
      .catch((err) => console.error(err));
  }, [groupChatListFetching, setGroupChatList]);

  useEffect(() => {
    setIsLoading(true);

    chatListFetching()
      .then((res) => {
        setChatList(res);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, [chatListFetching, setChatList]);

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
        groupChatListFetching()
          .then((res) => {
            setGroupChatList(res);
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
  }, [chatListFetching, groupChatListFetching, isWindowFocused, setChatList, setGroupChatList]);

  useEffect(() => {
    function handleDeletedMessage(
      message: MessageInterface,
      latestMessage: MessageInterface
    ) {
      setChatList((prevChatList: Chat[]) =>
        prevChatList
          .map((chat: Chat) => {
            if (
              chat._id === message.sender._id &&
              chat.latestMessage._id === message._id
            ) {
              return {
                ...message.sender,
                latestMessage,
              };
            } else if (
              chat._id === message.receiver._id &&
              chat.latestMessage._id === message._id
            ) {
              return {
                ...message.receiver,
                latestMessage,
              };
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

    socket.on("message-deleted-chat-list", handleDeletedMessage);

    return () => {
      socket.off("message-deleted-chat-list", handleDeletedMessage);
    };
  }, [setChatList]);

  useEffect(() => {
    function handleDeletedMessage(
      message: GroupMessageInterface,
      latestMessage: GroupMessageInterface
    ) {
      setGroupChatList((prevChatList: GroupChat[]) =>
        prevChatList
          .map((chat: GroupChat) => {
            if (
              chat._id === message.receiver &&
              chat.latestMessage._id === message._id
            ) {
              return {
                ...chat,
                latestMessage,
              };
            }
            return chat;
          })
          .sort((a, b) => {
            const aLatestCreatedAt = a.latestMessage?.createdAt;
            const bLatestCreatedAt = b.latestMessage?.createdAt;

            if (aLatestCreatedAt && bLatestCreatedAt) {
              return bLatestCreatedAt.localeCompare(aLatestCreatedAt);
            } else if (aLatestCreatedAt) {
              return -1;
            } else if (bLatestCreatedAt) {
              return 1;
            } else {
              const aCreatedAt = a.createdAt ?? "0000-00-00T00:00:00.000Z";
              const bCreatedAt = b.createdAt ?? "0000-00-00T00:00:00.000Z";
              return bCreatedAt.localeCompare(aCreatedAt);
            }
          })
      );
    }

    socket.on("group-message-deleted-group-chat-list", handleDeletedMessage);

    function handleEditGroupChat(groupChat: GroupChatWithoutLatestMessage) {
      setGroupChatList((prevGroupChatList) =>
        prevGroupChatList.map((prevGroupChat) => {
          if (prevGroupChat._id === groupChat._id) {
            return { ...groupChat, latestMessage: prevGroupChat.latestMessage };
          }
          return prevGroupChat;
        })
      );
    }
    socket.on("receive-edit-group-chat-list", handleEditGroupChat);

    async function handleGroupChatAdded({
      message,
      groupChat,
    }: {
      message: string;
      groupChat: GroupChatWithoutLatestMessage;
    }) {
      if (groupChat.creator !== user._id) {
        setOpenAlertSuccess(true);
        setSuccessMessage(message);
      }

      try {
        const response: AxiosResponse<GroupChat> = await axios.get(
          `http://localhost:8000/group-chat-list-chat/${groupChat._id}`,
          { withCredentials: true }
        );

        if (response.data)
          setGroupChatList((prevGroupChatList) =>
            [...prevGroupChatList, response.data].sort((a, b) => {
              const aLatestCreatedAt = a.latestMessage?.createdAt;
              const bLatestCreatedAt = b.latestMessage?.createdAt;

              if (aLatestCreatedAt && bLatestCreatedAt) {
                return bLatestCreatedAt.localeCompare(aLatestCreatedAt);
              } else if (aLatestCreatedAt) {
                return -1;
              } else if (bLatestCreatedAt) {
                return 1;
              } else {
                const aCreatedAt = a.createdAt ?? "0000-00-00T00:00:00.000Z";
                const bCreatedAt = b.createdAt ?? "0000-00-00T00:00:00.000Z";
                return bCreatedAt.localeCompare(aCreatedAt);
              }
            })
          );
        if (groupChat.creator === user._id)
          navigate(`/group-chat/${groupChat._id}`);
      } catch (err) {
        console.error(err);
      }
    }

    socket.on("group-chat-added", handleGroupChatAdded);

    function handleGroupChatRemoved({
      groupChat,
    }: {
      groupChat: GroupChatWithoutLatestMessage;
    }) {
      setGroupChatList((prevGroupChatList) =>
        prevGroupChatList.filter(
          (prevGroupChat) => prevGroupChat._id !== groupChat._id
        )
      );
    }

    socket.on("group-chat-removed", handleGroupChatRemoved);

    return () => {
      socket.off("group-message-deleted-group-chat-list", handleDeletedMessage);

      socket.off("receive-edit-group-chat-list", handleEditGroupChat);

      socket.off("group-chat-added", handleGroupChatAdded);

      socket.off("group-chat-removed", handleGroupChatRemoved);
    };
  }, [navigate, setGroupChatList, user._id]);

  useEffect(() => {
    socket.emit("join-room", user._id);
  }, [user._id]);

  useEffect(() => {
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
      socket.off("get-new-chat", getNewChatHandler);
    };
  }, [setChatList]);

  useEffect(() => {
    if (!groupChatList.length) return;

    function handleJoinRoom(groupChatId: string) {
      if (!joinedRooms.has(groupChatId)) {
        socket.emit("join-room", `group-chat-list-${groupChatId}`);
        setJoinedRooms((prevRooms) => new Set(prevRooms).add(groupChatId));
      }
    }

    groupChatList.forEach((groupChat) => handleJoinRoom(groupChat._id));
  }, [groupChatList, joinedRooms]);

  useEffect(() => {
    function getNewGroupChatHandler(returnedChat: GroupChat) {
      setGroupChatList((prevChatList) =>
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

    socket.on("get-new-group-chat", getNewGroupChatHandler);

    return () => {
      socket.off("get-new-group-chat", getNewGroupChatHandler);
    };
  }, [setGroupChatList]);

  const loadMoreUsers = () =>
    setLoadOffset((currentLoadOffset) => currentLoadOffset + 1);

  const loadMoreGroupChats = () =>
    setGroupLoadOffset((currentLoadOffset) => currentLoadOffset + 1);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        alignItems: "center",
      }}
    >
      {openAlertSuccess && (
        <AlertSuccess
          message={successMessage}
          open={openAlertSuccess}
          setOpen={setOpenAlertSuccess}
        />
      )}
      {showGroupForm && <CreateGroupForm setShowGroupForm={setShowGroupForm} />}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: `1px solid ${theme.lightGray}`,
          width: "100%",
          flexDirection: "column",
          pb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.midnightNavy,
            borderBottom: `1px solid ${theme.lightGray}`,
            width: "100%",
            textAlign: "center",
            p: 1,
          }}
        >
          Group chats
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
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
              margin: 1,
            }}
            onClick={() => setShowGroupForm(true)}
          >
            Create group chat
          </Button>
          <List sx={{ width: "100%", bgcolor: "background.paper", pt: 0 }}>
            {groupChatList.map((chatListItem) => (
              <MemoizedGroupListItem
                key={chatListItem._id}
                chatListItem={chatListItem}
                user={user}
              />
            ))}
          </List>
          {isLoadingGroupChats && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress sx={{ color: theme.deepBlue, p: 1 }} />
            </Box>
          )}

          {!isLoadingGroupChats && moreGroupChatsExist && (
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
              onClick={loadMoreGroupChats}
            >
              Load more
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.midnightNavy,
            borderBottom: `1px solid ${theme.lightGray}`,
            width: "100%",
            textAlign: "center",
            p: 1,
          }}
        >
          User list
        </Typography>
        <List sx={{ width: "100%", bgcolor: "background.paper", pt: 0 }}>
          {chatList.map((chatListItem) => (
            <MemoizedListItem
              key={chatListItem._id}
              chatListItem={chatListItem}
              user={user}
            />
          ))}
        </List>
        {isLoading && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: theme.deepBlue, p: 1 }} />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          flex: 1,
        }}
      >
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
              mx: 1,
              flex: 1,
            }}
            onClick={loadMoreUsers}
          >
            Load more
          </Button>
        )}
      </Box>
    </Box>
  );
});

export default ChatList;
