import axios, { AxiosResponse } from "axios";
import {
  useEffect,
  useState,
  memo,
  useContext,
  useCallback,
  ChangeEvent,
} from "react";
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
  AlertColor,
  InputBase,
} from "@mui/material";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
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
import AlertNotification from "../AlertNotification";

function formatLatestMessage(
  chatListItem: Chat | GroupChat,
  user: User,
  defaultMessage: string
) {
  const formatImageCount = (count: number) =>
    count === 1 ? "an" : count.toString();

  return chatListItem.latestMessage
    ? `${
        chatListItem.latestMessage.sender._id === user._id
          ? "You: "
          : chatListItem.latestMessage.sender._id !== chatListItem._id
          ? `${chatListItem.latestMessage.sender.username}: `
          : ""
      }${
        chatListItem.latestMessage.content
          ? chatListItem.latestMessage.content.length > 16
            ? chatListItem.latestMessage.content.slice(0, 16) + "..."
            : chatListItem.latestMessage.content
          : chatListItem.latestMessage.images?.length !== undefined
          ? `${
              chatListItem.latestMessage.sender._id === user._id ? "s" : "S"
            }ent ${formatImageCount(
              chatListItem.latestMessage.images.length
            )} image${
              chatListItem.latestMessage.images.length !== 1 ? "s" : ""
            }`
          : defaultMessage
      }`
    : defaultMessage;
}

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
            secondary={formatLatestMessage(
              chatListItem,
              user,
              "Start with a greeting!"
            )}
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
            secondary={formatLatestMessage(
              chatListItem,
              user,
              "Say hello to the group!"
            )}
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
  const [openAlertNotification, setOpenAlertNotification] = useState(false);
  const [alertNotificationMessage, setAlertNotificationMessage] = useState("");
  const [alertNotificationType, setAlertNotificationType] =
    useState<AlertColor>("info");
  const [groupSearchValue, setGroupSearchValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const chatListFetching = useCallback(async () => {
    const response: AxiosResponse<Chat[]> = await axios.get(
      `${import.meta.env.VITE_BACK_END_URL}/chat-list`,
      {
        params: { loadOffset, searchValue },

        withCredentials: true,
      }
    );

    setMoreChatsExist(response.data.length === 10 * loadOffset);

    return response.data;
  }, [loadOffset, searchValue]);

  const groupChatListFetching = useCallback(async () => {
    const response: AxiosResponse<GroupChat[]> = await axios.get(
      `${import.meta.env.VITE_BACK_END_URL}/group-chat-list`,
      {
        params: { loadOffset: groupLoadOffset, searchValue: groupSearchValue },

        withCredentials: true,
      }
    );

    setMoreGroupChatsExist(response.data.length === 5 * groupLoadOffset);

    return response.data;
  }, [groupLoadOffset, groupSearchValue]);

  useEffect(() => {
    if (groupSearchValue !== "") return;
    setIsLoadingGroupChats(true);

    groupChatListFetching()
      .then((res) => {
        setGroupChatList(res);
        setIsLoadingGroupChats(false);
      })
      .catch(() => {
        /*Empty*/
      });
  }, [groupChatListFetching, groupSearchValue, setGroupChatList]);

  useEffect(() => {
    if (searchValue !== "") return;
    setIsLoading(true);

    chatListFetching()
      .then((res) => {
        setChatList(res);
        setIsLoading(false);
      })
      .catch(() => {
        /*Empty*/
      });
  }, [chatListFetching, searchValue, setChatList]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWindowFocused) {
      intervalId = setInterval(() => {
        chatListFetching()
          .then((res) => {
            setChatList(res);
            setIsLoading(false);
          })
          .catch(() => {
            /*Empty*/
          });
      }, 60000);
    } else {
      clearInterval(intervalId!);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [chatListFetching, groupChatListFetching, isWindowFocused, setChatList, setGroupChatList]);

  useEffect(() => {
    async function handleDeletedMessage(message: MessageInterface) {
      let chatListItem: Chat;
      if (message.sender._id !== user._id) {
        const response: AxiosResponse<Chat> = await axios.get(
          `${import.meta.env.VITE_BACK_END_URL}/chat-list-chat/${
            message.sender._id
          }`,
          { withCredentials: true }
        );
        chatListItem = response.data;
      }
      if (message.receiver._id !== user._id) {
        const response: AxiosResponse<Chat> = await axios.get(
          `${import.meta.env.VITE_BACK_END_URL}/chat-list-chat/${
            message.receiver._id
          }`,
          { withCredentials: true }
        );
        chatListItem = response.data;
      }

      setChatList((prevChatList: Chat[]) =>
        prevChatList
          .map((chat: Chat) => {
            if (
              chat._id === message.sender._id ||
              chat._id === message.receiver._id
            )
              if (chatListItem) return chatListItem;

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
              const aCreatedAt = a.lastOnline ?? "0000-00-00T00:00:00.000Z";
              const bCreatedAt = b.lastOnline ?? "0000-00-00T00:00:00.000Z";
              return bCreatedAt.localeCompare(aCreatedAt);
            }
          })
      );
    }

    socket.on("message-deleted-chat-list", handleDeletedMessage);

    return () => {
      socket.off("message-deleted-chat-list", handleDeletedMessage);
    };
  }, [setChatList, user._id]);

  useEffect(() => {
    async function handleDeletedMessage(message: GroupMessageInterface) {
      const response: AxiosResponse<GroupChat> = await axios.get(
        `${import.meta.env.VITE_BACK_END_URL}/group-chat-list-chat/${
          message.receiver
        }`,
        { withCredentials: true }
      );

      const chatListItem = response.data;

      setGroupChatList((prevGroupChatList: GroupChat[]) =>
        prevGroupChatList
          .map((chat: GroupChat) => {
            if (chat._id === message.receiver) {
              return chatListItem;
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
        setAlertNotificationMessage(message);
        setAlertNotificationType("info");
        setOpenAlertNotification(true);
      }

      try {
        const response: AxiosResponse<GroupChat> = await axios.get(
          `${import.meta.env.VITE_BACK_END_URL}/group-chat-list-chat/${
            groupChat._id
          }`,
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
      } catch {
        /*Empty*/
      }
    }

    socket.on("group-chat-added", handleGroupChatAdded);

    function handleGroupChatRemoved({
      groupChat,
    }: {
      groupChat: GroupChatWithoutLatestMessage;
    }) {
      socket.emit("leave-room", `group-chat-list-${groupChat._id}`);
      setGroupChatList((prevGroupChatList) =>
        prevGroupChatList.filter(
          (prevGroupChat) => prevGroupChat._id !== groupChat._id
        )
      );
    }

    socket.on("group-chat-removed", handleGroupChatRemoved);

    socket.on("group-chat-deleted", handleGroupChatRemoved);

    return () => {
      socket.off("group-message-deleted-group-chat-list", handleDeletedMessage);

      socket.off("receive-edit-group-chat-list", handleEditGroupChat);

      socket.off("group-chat-added", handleGroupChatAdded);

      socket.off("group-chat-removed", handleGroupChatRemoved);

      socket.off("group-chat-deleted", handleGroupChatRemoved);
    };
  }, [setGroupChatList, user._id]);

  useEffect(() => {
    socket.emit("join-room", user._id);
    return () => {
      socket.emit("leave-room", user._id);
    };
  }, [user]);

  useEffect(() => {
    function getNewChatHandler(returnedChat: Chat) {
      setChatList((prevChatList) => {
        const isChatInList = prevChatList.some(
          (chat) => chat._id === returnedChat._id
        );

        if (isChatInList)
          return prevChatList
            .map((chat) => {
              if (chat._id === returnedChat._id) {
                const isLatestMessage = chat.latestMessage
                  ? new Date(returnedChat.latestMessage.createdAt) >
                    new Date(chat.latestMessage.createdAt)
                  : true;
                if (isLatestMessage) return returnedChat;
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
                const aCreatedAt = a.lastOnline ?? "0000-00-00T00:00:00.000Z";
                const bCreatedAt = b.lastOnline ?? "0000-00-00T00:00:00.000Z";
                return bCreatedAt.localeCompare(aCreatedAt);
              }
            });
        else return [returnedChat, ...prevChatList];
      });
    }

    socket.on("get-new-chat", getNewChatHandler);

    return () => {
      socket.off("get-new-chat", getNewChatHandler);
    };
  }, [setChatList]);

  useEffect(() => {
    function getNewGroupChatHandler(returnedChat: GroupChat) {
      setGroupChatList((prevGroupChatList) => {
        const isChatInList = prevGroupChatList.some(
          (chat) => chat._id === returnedChat._id
        );

        if (isChatInList)
          return prevGroupChatList
            .map((chat) => {
              if (chat._id === returnedChat._id) {
                const isLatestMessage = chat.latestMessage
                  ? new Date(returnedChat.latestMessage.createdAt) >
                    new Date(chat.latestMessage.createdAt)
                  : true;
                if (isLatestMessage) return returnedChat;
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
            });
        else return [returnedChat, ...prevGroupChatList];
      });
    }

    socket.on("get-new-group-chat", getNewGroupChatHandler);

    return () => {
      socket.off("get-new-group-chat", getNewGroupChatHandler);
    };
  }, [setGroupChatList]);

  useEffect(() => {
    setGroupLoadOffset(1);
  }, [groupSearchValue]);

  useEffect(() => {
    if (groupSearchValue === "") return;

    setIsLoadingGroupChats(true);
    const getData = setTimeout(() => {
      groupChatListFetching()
        .then((res) => {
          setGroupChatList(res);
          setIsLoadingGroupChats(false);
        })
        .catch(() => {
          /*EMPTY*/
        });
    }, 500);

    return () => clearTimeout(getData);
  }, [groupChatListFetching, groupSearchValue, setGroupChatList]);

  useEffect(() => {
    setLoadOffset(1);
  }, [searchValue]);

  useEffect(() => {
    if (searchValue === "") return;

    setIsLoading(true);
    const getData = setTimeout(() => {
      chatListFetching()
        .then((res) => {
          setChatList(res);
          setIsLoading(false);
        })
        .catch(() => {
          /*EMPTY*/
        });
    }, 500);

    return () => clearTimeout(getData);
  }, [chatListFetching, searchValue, setChatList]);

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
      {openAlertNotification && (
        <AlertNotification
          message={alertNotificationMessage}
          type={alertNotificationType}
          open={openAlertNotification}
          setOpen={setOpenAlertNotification}
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
              bgcolor: theme.deepBlue,
              color: theme.creamy,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#155e75",
              },
              borderRadius: 10,
              mx: 1,
              mt: 1,
              textTransform: "none",
              fontSize: "1rem",
            }}
            onClick={() => setShowGroupForm(true)}
          >
            Create group chat
          </Button>
          <Box sx={{ width: "100%", p: 1 }}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                border: `1px solid rgba(0, 0, 0, 0.23)`,
                borderRadius: 10,
                p: 1,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, color: "rgba(0, 0, 0, 0.87)" }}
                placeholder="Search for group chats"
                inputProps={{ "aria-label": "search group chats" }}
                value={groupSearchValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setGroupSearchValue(e.target.value)
                }
              />
            </Box>
          </Box>
          {groupChatList.length === 0 &&
            !isLoadingGroupChats &&
            groupSearchValue && (
              <Typography sx={{ textAlign: "center" }} variant="h5">
                No matching group chats found
              </Typography>
            )}
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
                bgcolor: theme.deepBlue,
                color: theme.creamy,
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#155e75",
                },
                borderRadius: 10,
                mx: 1,
                textTransform: "none",
                fontSize: "1rem",
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
        <Box sx={{ width: "100%", p: 1 }}>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              border: `1px solid rgba(0, 0, 0, 0.23)`,
              borderRadius: 10,
              p: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: "rgba(0, 0, 0, 0.87)" }}
              placeholder="Search for users"
              inputProps={{ "aria-label": "search users" }}
              value={searchValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
            />
          </Box>
        </Box>
        {chatList.length === 0 && !isLoading && (
          <Typography sx={{ textAlign: "center" }} variant="h5">
            No matching users found
          </Typography>
        )}
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
              bgcolor: theme.deepBlue,
              color: theme.creamy,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#155e75",
              },
              borderRadius: 10,
              mx: 1,
              textTransform: "none",
              fontSize: "1rem",
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
