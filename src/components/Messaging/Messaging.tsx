import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { MessageInterface } from "../types/Message";
import {
  Avatar,
  Box,
  Typography,
  useTheme,
  InputBase,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { DatabaseUserResponse, User } from "../types/User";
import TimeAgo from "react-timeago";
import WindowFocusContext from "../../context/WindowsFocusContext";
import Messages from "./Messages";
import socket from "../../socket/socket";
import LoadingScreen from "../UtilityComponents/LoadingScreen";

type setOpenType = (open: boolean) => void;
type setMessagingUserExistsType = (open: boolean) => void;

function Messaging({
  isSocketConnected,
  open,
  setOpen,
  setMessagingUserExists,
}: {
  isSocketConnected: boolean;
  open: boolean;
  setOpen: setOpenType;
  setMessagingUserExists: setMessagingUserExistsType;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const { selectedUserId } = useParams();
  const isWindowFocused = useContext(WindowFocusContext);
  const [message, setMessage] = useState("");
  const roomId = [user._id, selectedUserId].sort().join("-");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialMessageFetching, setInitialMessageFetching] = useState(true);
  const [skipAmount, setSkipAmount] = useState(0);
  const [moreMessagesExist, setMoreMessagesExist] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [newMessageAdded, setNewMessageAdded] = useState(false);
  const [isMessageValid, setIsMessageValid] = useState(true);
  const [selectedUserExists, setSelectedUserExists] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const {
    data: selectedUser,
    isLoading: isLoadingSelectedUser,
    refetch,
  } = useQuery<User | undefined, Error>({
    queryKey: ["databaseUserData", selectedUserId],
    queryFn: getDatabaseUser,
    retry: false,
    refetchInterval: isWindowFocused && selectedUserExists ? 1000 * 60 : false,
  });

  async function getDatabaseUser() {
    const response: AxiosResponse<DatabaseUserResponse> = await axios.get(
      `http://localhost:8000/user/${selectedUserId}`,
      { withCredentials: true }
    );

    setSelectedUserExists(!!response.data.user);
    setMessagingUserExists(!!response.data.user);

    return response.data.user;
  }

  // Cleanup function when users from user list are selected (Messaging component doesn't unmount, just the selectedUserId changes)
  useEffect(() => {
    return () => {
      setSkipAmount(0);
      setMessage("");
      setNewMessageAdded(false);
      setPrevScrollHeight(0);
      setShowLoadingScreen(false);
      setIsMessageValid(true);
      setOpen(isSmallScreen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  useEffect(() => {
    setOpen(isSmallScreen);
  }, [isSmallScreen, setOpen]);

  useEffect(() => {
    setTimeout(() => {
      setShowLoadingScreen(true);
    }, 1000);
  }, []);

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
    socket.emit("join-room", roomId);
  }, [roomId]);

  useEffect(() => {
    const receiveMessageHandler = (message: MessageInterface) => {
      addNewMessage(message);
      void refetch();
    };
    socket.on("receive-message", receiveMessageHandler);

    return () => {
      socket.off("receive-message", receiveMessageHandler);
    };
  }, [addNewMessage, refetch]);

  useEffect(() => {
    if (
      !isLoadingSelectedUser &&
      selectedUser &&
      selectedUserExists &&
      (selectedUserName === "" || selectedUserName !== selectedUser.username)
    ) {
      const fetchMessages = async () => {
        const res: AxiosResponse<MessageInterface[]> = await axios.get(
          "http://localhost:8000/messages",
          {
            params: {
              user: user._id,
              selectedUser: selectedUser._id,
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
          setMoreMessagesExist(res.length === 30);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setInitialMessageFetching(false);
          setSelectedUserName(selectedUser.username);
        });

      return () => {
        setInitialMessageFetching(false);
      };
    }
  }, [
    isLoadingSelectedUser,
    selectedUser,
    selectedUserExists,
    selectedUserName,
    user._id,
  ]);

  // For the first load scroll to the bottom after messages are loaded
  useEffect(() => {
    if (!isInitialMessageFetching && skipAmount === 0) {
      scrollToBottom();
    }
  }, [isInitialMessageFetching, skipAmount]);

  const fetchMoreMessages = useCallback(async () => {
    const res: AxiosResponse<MessageInterface[]> = await axios.get(
      "http://localhost:8000/messages",
      {
        params: {
          user: user._id,
          selectedUser: selectedUserId,
          skipAmount: skipAmount + 30,
        },
        withCredentials: true,
      }
    );
    return res.data;
  }, [selectedUserId, skipAmount, user._id]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (
      messagesContainer &&
      messages.length &&
      selectedUser &&
      moreMessagesExist
    ) {
      const hasVerticalScrollbar =
        messagesContainer.scrollHeight > messagesContainer.clientHeight;
      if (!hasVerticalScrollbar) {
        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 30);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }, [fetchMoreMessages, messages.length, moreMessagesExist, selectedUser]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop === 0 && moreMessagesExist) {
        setPrevScrollHeight(e.currentTarget.scrollHeight);

        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 30);
          })
          .catch((err) => {
            console.error(err);
          });

        setNewMessageAdded(false);
        setSkipAmount((prevSkipAmount) => prevSkipAmount + 30);
      }
    },
    [fetchMoreMessages, moreMessagesExist]
  );

  useLayoutEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (
      messagesContainer &&
      prevScrollHeight &&
      messages.length > 30 &&
      !newMessageAdded
    ) {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight - prevScrollHeight;
    }
  }, [messages.length, newMessageAdded, prevScrollHeight]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
      setIsMessageValid(true);
    },
    []
  );
  const handleMessageSubmit = () => {
    if (message.trim() === "") {
      setIsMessageValid(false);
    } else {
      socket.emit("send-message", message, user._id, selectedUserId, roomId);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!selectedUser && !isLoadingSelectedUser) {
      navigate("/user-not-found");
    }
  }, [isLoadingSelectedUser, navigate, selectedUser]);

  return (
    <>
      {!isInitialMessageFetching && isSocketConnected && selectedUser && (
        <Box
          sx={{
            display: open && !isSmallScreen ? "none" : "flex",
            flexDirection: "column",
            flex: 1,
            height: "100%",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",

              p: 2,
              gap: 2,
              borderBottom: `1px solid ${theme.lightGray}`,
            }}
          >
            <Link to={`/user/${selectedUser._id}`}>
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
              <Box sx={{ maxWidth: "max-content" }}>
                <Link to={`/user/${selectedUser._id}`}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {selectedUser.username}
                  </Typography>
                </Link>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  {selectedUser.online ? "Online" : "Offline"}
                </Typography>
                {!selectedUser.online && (
                  <TimeAgo
                    date={selectedUser.lastOnline}
                    minPeriod={10}
                    style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: "1rem" }}
                    key={selectedUser.lastOnline}
                  />
                )}
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
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderTop: `1px solid ${theme.lightGray}`,
            }}
          >
            <InputBase
              placeholder="Type a message here..."
              value={message}
              onInput={handleInputChange}
              multiline
              maxRows={3}
              autoFocus
              required
              error={!isMessageValid}
              inputProps={{ maxLength: 1000, spellCheck: false }}
              sx={{
                flex: 1,
                padding: 2,
                borderRadius: 10,
                boxShadow: 1,
                border: "1px solid transparent",
                "&.Mui-error": {
                  border: isMessageValid ? undefined : "1px solid red",
                },
              }}
            />
            <button
              onClick={handleMessageSubmit}
              style={{
                width: 50,
                height: 50,
                backgroundColor: theme.deepBlue,
                borderRadius: 50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <svg
                fill="#fff"
                height="30px"
                width="30px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 495.003 495.003"
                xmlSpace="preserve"
              >
                <g id="XMLID_51_">
                  <path
                    id="XMLID_53_"
                    d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616
		l-67.6-32.22V456.687z"
                  />
                  <path
                    id="XMLID_52_"
                    d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422
		c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414
		l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956
		L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"
                  />
                </g>
              </svg>
            </button>
          </Box>
        </Box>
      )}
      {isLoadingSelectedUser &&
        isInitialMessageFetching &&
        showLoadingScreen && <LoadingScreen />}
    </>
  );
}

export default Messaging;
