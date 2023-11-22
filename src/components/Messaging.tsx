import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { MessageInterface } from "./types/Message";
import {
  Avatar,
  Box,
  Typography,
  useTheme,
  InputBase,
  Button,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { DatabaseUserResponse, User } from "./types/User";
import TimeAgo from "react-timeago";
import WindowFocusContext from "../context/WindowsFocusContext";
import Messages from "./UserComponents/Messages";
import socket from "../socket/socket";

function Messaging() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const { selectedUserId } = useParams();
  const isWindowFocused = useContext(WindowFocusContext);
  const [message, setMessage] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const roomId = [user._id, selectedUserId].sort().join("-");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialMessageFetching, setInitialMessageFetching] = useState(true);
  const [skipAmount, setSkipAmount] = useState(0);
  const [moreMessagesExist, setMoreMessagesExist] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  // For useLayoutEffect to work properly
  const [newMessageAdded, setNewMessageAdded] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 0);
  };

  const addNewMessage = useCallback((newMessage: MessageInterface) => {
    setMessages((previousMessages) => {
      if (previousMessages.length === 0) return [newMessage];
      return [...previousMessages, newMessage];
    });
    setSkipAmount((prevSkipAmount) => prevSkipAmount + 1);
    scrollToBottom();
    setNewMessageAdded(true);
  }, []);

  useEffect(() => {
    function onSocketConnect() {
      setIsSocketConnected(true);
    }
    socket.connect();
    socket.on("connect", onSocketConnect);
    socket.emit("join-room", roomId);

    return () => {
      socket.off("connect", onSocketConnect);
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const receiveMessageHandler = (message: MessageInterface) => {
      addNewMessage(message);
    };

    socket.on("receive-message", receiveMessageHandler);
    return () => {
      socket.off("receive-message", receiveMessageHandler);
    };
  }, [addNewMessage]);

  async function getDatabaseUser() {
    const response: AxiosResponse<DatabaseUserResponse> = await axios.get(
      `http://localhost:8000/user/${selectedUserId}`,
      { withCredentials: true }
    );
    return response.data.user;
  }

  const { data: selectedUser, isLoading: isLoadingSelectedUser } = useQuery<
    User | undefined,
    Error
  >({
    queryKey: ["databaseUserData"],
    queryFn: getDatabaseUser,
    retry: false,
    refetchInterval: isWindowFocused ? 1000 * 60 : false,
  });

  useEffect(() => {
    if (isLoadingSelectedUser) return;

    const fetchMessages = async () => {
      const res: AxiosResponse<MessageInterface[]> = await axios.get(
        "http://localhost:8000/messages",
        {
          params: {
            user: user._id,
            selectedUser: selectedUserId,
            skipAmount: 0,
          },
          withCredentials: true,
        }
      );
      return res.data;
    };

    setInitialMessageFetching(true);

    fetchMessages()
      .then((res) => {
        setMessages(res);
        setMoreMessagesExist(res.length === 20);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setInitialMessageFetching(false);
      });

    return () => {
      setInitialMessageFetching(false);
    };
  }, [isLoadingSelectedUser, selectedUserId, user._id]);

  // For the first load scroll to the bottom after messages are loaded
  useEffect(() => {
    if (!isInitialMessageFetching && skipAmount === 0) {
      scrollToBottom();
    }
  }, [isInitialMessageFetching, skipAmount]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop === 0 && moreMessagesExist) {
        setPrevScrollHeight(e.currentTarget.scrollHeight);

        const fetchMoreMessages = async () => {
          const res: AxiosResponse<MessageInterface[]> = await axios.get(
            "http://localhost:8000/messages",
            {
              params: {
                user: user._id,
                selectedUser: selectedUserId,
                skipAmount: skipAmount + 20,
              },
              withCredentials: true,
            }
          );
          return res.data;
        };

        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 20);
          })
          .catch((err) => {
            console.error(err);
          });

        setNewMessageAdded(false);
        setSkipAmount((prevSkipAmount) => prevSkipAmount + 20);
      }
    },
    [moreMessagesExist, selectedUserId, skipAmount, user._id]
  );

  useLayoutEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (
      messagesContainer &&
      prevScrollHeight &&
      messages.length > 20 &&
      !newMessageAdded
    ) {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight - prevScrollHeight;
    }
  }, [messages.length, newMessageAdded, prevScrollHeight]);

  const handleMessageSubmit = () => {
    socket.emit("send-message", message, user._id, selectedUserId, roomId);
    setMessage("");
  };

  return (
    !isInitialMessageFetching &&
    isSocketConnected &&
    selectedUser && (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          my: 2,
          flex: 1,
          overflow: "hidden",
          // borderLeft: `1px solid ${theme.lightGray}`,
          // borderRight: `1px solid ${theme.lightGray}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.lightGray}`,
            p: 2,
            gap: 2,
          }}
        >
          <Link to={`/profile/${selectedUser._id}`}>
            <Avatar
              alt="Profile picture"
              src={selectedUser?.img}
              sx={{
                width: 50,
                height: 50,
                bgcolor: theme.deepBlue,
              }}
            >
              {!selectedUser?.img
                ? selectedUser?.username[0].toUpperCase()
                : null}
            </Avatar>
          </Link>
          <Box>
            <Link to={`/profile/${selectedUser._id}`}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedUser.username}
              </Typography>
            </Link>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{ color: "rgba(0, 0, 0, 0.6)" }}
              >
                {selectedUser.online ? "Online" : "Offline"}
              </Typography>
              <TimeAgo
                date={selectedUser.lastOnline}
                minPeriod={60}
                style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: "1rem" }}
              />
            </Box>
          </Box>
        </Box>
        <Messages
          messages={messages}
          messagesEndRef={messagesEndRef}
          handleScroll={handleScroll}
          messagesContainerRef={messagesContainerRef}
        />
        <Box
          sx={{
            boxShadow: 5,
            p: 2,
            display: "flex",
          }}
        >
          <InputBase
            placeholder="Type a message here..."
            value={message}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            multiline
            sx={{
              flex: 1,
              padding: 2,
              borderRadius: 10,
              boxShadow: 1,
            }}
          />
          <Button onClick={handleMessageSubmit}>Submit</Button>
        </Box>
      </Box>
    )
  );
}

export default Messaging;
