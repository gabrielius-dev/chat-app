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
  AlertColor,
  IconButton,
  Skeleton,
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
  memo,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { DatabaseUserResponse, User } from "../types/User";
import TimeAgo from "react-timeago";
import WindowFocusContext from "../../context/WindowsFocusContext";
import Messages from "./Messages";
import socket from "../../socket/socket";
import LoadingScreen from "../UtilityComponents/LoadingScreen";
import { formatDateString } from "../utils/formatDate";
import { useChatContext } from "../../context/useChatContext";
import { isEqual } from "lodash";
import AlertNotification from "../UtilityComponents/AlertNotification";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import compressImage from "../UtilityComponents/compressImage";
import { v4 as uuidv4 } from "uuid";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const Messaging = memo(function Messaging({
  isSocketConnected,
  open,
  setOpen,
}: {
  isSocketConnected: boolean;
  open: boolean;
  setOpen: setOpenType;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const { selectedUserId } = useParams();
  const isWindowFocused = useContext(WindowFocusContext);
  const { setChatList } = useChatContext();
  const roomId = [user._id, selectedUserId].sort().join("-");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialMessageFetching, setInitialMessageFetching] = useState(true);
  const [skipAmount, setSkipAmount] = useState(0);
  const [moreMessagesExist, setMoreMessagesExist] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isMessageValid, setIsMessageValid] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [moreMessagesShowed, setMoreMessagesShowed] = useState(true);
  const [previousSelectedUserUsername, setPreviousSelectedUserUsername] =
    useState("");
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();
  const [openAlertNotification, setOpenAlertNotification] = useState(false);
  const [alertNotificationMessage, setAlertNotificationMessage] = useState("");
  const [alertNotificationType, setAlertNotificationType] =
    useState<AlertColor>("info");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const messageInputRef = useRef<HTMLInputElement>();
  const [selectedImagesLength, setSelectedImagesLength] = useState(0);
  const [messagesDeleted, setMessagesDeleted] = useState(0);

  const { data: selectedUser, isLoading: isLoadingSelectedUser } = useQuery<
    User | undefined,
    Error
  >({
    queryKey: ["databaseUserData", selectedUserId],
    queryFn: getDatabaseUser,
    retry: false,
    refetchInterval: isWindowFocused ? 1000 * 60 : false,
    refetchOnWindowFocus: false,
  });

  async function getDatabaseUser() {
    const response: AxiosResponse<DatabaseUserResponse> = await axios.get(
      `${import.meta.env.VITE_BACK_END_URL}/user/${selectedUserId}`,
      { withCredentials: true }
    );

    return response.data.user;
  }

  useEffect(() => {
    setOpen(isSmallScreen);
  }, [isSmallScreen, setOpen]);

  useEffect(() => {
    if (selectedUser)
      setChatList((prevChatList) =>
        prevChatList.map((chat) => {
          if (chat._id === selectedUser._id) {
            return {
              ...selectedUser,
              latestMessage: chat.latestMessage,
            };
          }
          return chat;
        })
      );
  }, [selectedUser, setChatList]);

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
    }, 300);
  };

  const addNewMessage = useCallback((newMessage: MessageInterface) => {
    setMessages((previousMessages) => {
      // To remove loading message when the real message arrives if loading message even existed
      const filteredMessages = previousMessages.filter(
        (message) =>
          !newMessage.sendingIndicatorId ||
          message.sendingIndicatorId !== newMessage.sendingIndicatorId
      );

      const updatedMessages = [...filteredMessages, newMessage];

      const previousMessagesCopy = [...updatedMessages];

      updatedMessages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const orderChanged = !isEqual(previousMessagesCopy, updatedMessages);

      if (!orderChanged) {
        scrollToBottom();
      }

      return updatedMessages;
    });
    setSkipAmount((prevSkipAmount) => prevSkipAmount + 1);
  }, []);

  useEffect(() => {
    socket.emit("join-room", roomId);
    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId, user]);

  useEffect(() => {
    if (!selectedUser && messages.length === 0) return;

    function messageDeletedHandler(message: MessageInterface) {
      setMessagesDeleted((prevCount) => prevCount + 1);
      setMessages((previousMessages) =>
        previousMessages.filter(
          (prevMessage) => prevMessage._id !== message._id
        )
      );
    }

    socket.on("message-deleted", messageDeletedHandler);
    return () => {
      socket.off("message-deleted", messageDeletedHandler);
    };
  }, [messages, selectedUser]);

  useEffect(() => {
    function handleMessageError({ message }: { message: string }) {
      setAlertNotificationMessage(message);
      setAlertNotificationType("error");
      setOpenAlertNotification(true);
    }

    socket.on("message-error", handleMessageError);
    return () => {
      socket.off("message-error", handleMessageError);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const receiveMessageHandler = (message: MessageInterface) => {
      addNewMessage(message);
      if (
        message.sender._id === selectedUser?._id &&
        !isEqual(message.sender, selectedUser)
      ) {
        queryClient.setQueryData(
          ["databaseUserData", selectedUser._id],
          message.sender
        );
      } else if (
        message.sender._id !== selectedUser?._id &&
        !isEqual(message.receiver, selectedUser)
      ) {
        queryClient.setQueryData(
          ["databaseUserData", selectedUser._id],
          message.receiver
        );
      }
    };
    socket.on("receive-message", receiveMessageHandler);

    return () => {
      socket.off("receive-message", receiveMessageHandler);
    };
  }, [addNewMessage, queryClient, selectedUser, user._id]);

  useEffect(() => {
    if (
      !isLoadingSelectedUser &&
      selectedUser &&
      selectedUser.username !== previousSelectedUserUsername
    ) {
      const fetchMessages = async () => {
        const res: AxiosResponse<MessageInterface[]> = await axios.get(
          `${import.meta.env.VITE_BACK_END_URL}/messages`,
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
        .catch(() => {
          /* empty */
        })
        .finally(() => {
          setInitialMessageFetching(false);
          setPreviousSelectedUserUsername(selectedUser.username);
        });

      return () => {
        setInitialMessageFetching(false);
      };
    }
  }, [
    isLoadingSelectedUser,
    previousSelectedUserUsername,
    selectedUser,
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
      `${import.meta.env.VITE_BACK_END_URL}/messages`,
      {
        params: {
          user: user._id,
          selectedUser: selectedUserId,
          skipAmount: skipAmount + 30 - messagesDeleted,
        },
        withCredentials: true,
      }
    );
    setSkipAmount((prevSkipAmount) => prevSkipAmount + 30);

    return res.data;
  }, [messagesDeleted, selectedUserId, skipAmount, user._id]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (
      messagesContainer &&
      messages.length &&
      selectedUser &&
      moreMessagesExist &&
      moreMessagesShowed
    ) {
      const hasVerticalScrollbar =
        messagesContainer.scrollHeight > messagesContainer.clientHeight;
      if (!hasVerticalScrollbar) {
        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 30);
            setMoreMessagesShowed(false);
          })
          .catch(() => {
            /* empty */
          });
      }
    }
  }, [
    fetchMoreMessages,
    messages.length,
    moreMessagesExist,
    moreMessagesShowed,
    selectedUser,
  ]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const messagesContainer = messagesContainerRef.current;
      if (!messagesContainer) return;
      const hasVerticalScrollbar =
        messagesContainer.scrollHeight > messagesContainer.clientHeight;
      if (e.currentTarget.scrollTop === 0 && moreMessagesExist) {
        setPrevScrollHeight(e.currentTarget.scrollHeight);

        if (!hasVerticalScrollbar) return;

        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 30);
            setMoreMessagesShowed(false);
          })
          .catch(() => {
            /* empty */
          });
      }
    },
    [fetchMoreMessages, moreMessagesExist]
  );

  useLayoutEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer && prevScrollHeight && !moreMessagesShowed) {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight - prevScrollHeight;
      setMoreMessagesShowed(true);
    }
  }, [moreMessagesShowed, prevScrollHeight]);

  const handleInputChange = useCallback(() => {
    setIsMessageValid(true);
  }, []);

  const handleMessageSubmit = async () => {
    if (!messageInputRef.current || !selectedUserId) return;

    const message = messageInputRef.current.value;

    if (selectedImagesLength !== selectedImages?.length) {
      setAlertNotificationMessage(
        "Please wait a moment while the images are loading. This may take a few seconds."
      );
      setAlertNotificationType("info");
      setOpenAlertNotification(true);
      return;
    }

    if (message.trim() === "" && selectedImages.length === 0) {
      setIsMessageValid(false);
    } else {
      setIsMessageValid(true);
      messageInputRef.current.value = "";
      setSelectedImages([]);
      setSelectedImagesLength(0);
      const formData = new FormData();

      const createdAt = Date.now();

      //Show loading message if message contains image(s)
      if (selectedImages.length > 0) {
        const uniqueId: string = uuidv4();

        // Minus one millisecond to show loading message before text message if it exists
        const currentDate = new Date(createdAt);
        const datePlusOneMillisecond = new Date(currentDate.getTime() - 1);

        const datePlusOneMillisecondString =
          datePlusOneMillisecond.toISOString();

        const loadingMessage: MessageInterface = {
          _id: uniqueId,
          createdAt: datePlusOneMillisecondString,
          sender: {
            username: "NOT IMPORTANT",
            _id: "NOT IMPORTANT",
            lastOnline: "NOT IMPORTANT",
            online: false,
          },
          receiver: {
            username: "NOT IMPORTANT",
            _id: "NOT IMPORTANT",
            lastOnline: "NOT IMPORTANT",
            online: false,
          },
          sendingIndicatorId: uniqueId,
          images: [
            {
              width: selectedImages.length,
              height: selectedImages.length,
              url: "NOT IMPORTANT",
            },
          ],
        };
        setMessages((prevMessages) => [...prevMessages, loadingMessage]);
        scrollToBottom();
        formData.append("sendingIndicatorId", uniqueId);
      }

      if (message.trim()) formData.append("message", message);
      else formData.append("message", "");

      formData.append("sender", user._id);
      formData.append("receiver", selectedUserId);
      formData.append("createdAt", createdAt.toString());
      formData.append("roomId", roomId);

      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          formData.append("images", image);
        }
      }
      try {
        await axios.post(`${import.meta.env.VITE_BACK_END_URL}/message`, formData, {
          withCredentials: true,
        });
      } catch {
        /* empty */
      }
    }
  };

  useEffect(() => {
    if (!selectedUser && !isLoadingSelectedUser) {
      navigate("/user-not-found");
    }
  }, [isLoadingSelectedUser, navigate, selectedUser]);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedImages = e.target.files;

      if (selectedImages) {
        setSelectedImagesLength(
          (prevLength) => selectedImages.length + prevLength
        );
        for (const image of selectedImages) {
          try {
            const compressedImage = await compressImage(image);

            setSelectedImages((prevSelectedImages) => [
              ...prevSelectedImages,
              compressedImage,
            ]);
          } catch {
            /* empty */
          }
        }
      }
    },
    []
  );

  function removeSelectedImage(image: File) {
    setSelectedImages((prevSelectedImages) =>
      prevSelectedImages.filter(
        (prevSelectedImage) => prevSelectedImage !== image
      )
    );
    setSelectedImagesLength((prevLength) => prevLength - 1);
  }

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
          {openAlertNotification && (
            <AlertNotification
              message={alertNotificationMessage}
              type={alertNotificationType}
              open={openAlertNotification}
              setOpen={setOpenAlertNotification}
            />
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              gap: 2,
              borderBottom: `1px solid ${theme.lightGray}`,
              maxHeight: "40vh",
              overflowY: "auto",
            }}
          >
            <Link to={`/user/${selectedUser._id}`}>
              <Avatar
                alt="Profile picture"
                src={selectedUser?.img}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: theme.midnightNavy,
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", wordBreak: "break-all" }}
                  >
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
                    title={formatDateString(selectedUser.lastOnline)}
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
              gap: 2,
              borderTop: `1px solid ${theme.lightGray}`,
              alignItems: "center",
            }}
          >
            <IconButton component="label" htmlFor="fileInput">
              <AddPhotoAlternateRoundedIcon sx={{ color: theme.deepBlue }} />
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => void handleFileChange(e)}
              />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                borderRadius: 10,
                boxShadow: 1,
                border: isMessageValid
                  ? "1px solid transparent"
                  : "1px solid red",
                width: "100%",
                overflow: "hidden",
              }}
            >
              {selectedImagesLength > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    overflowX: "auto",
                  }}
                >
                  {selectedImages.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        sx={{
                          position: "absolute",
                          right: -10,
                          top: -10,
                          backgroundColor: "white",
                          borderRadius: 50,
                          p: 0.5,
                          "&:hover": {
                            backgroundColor: "white",
                          },
                        }}
                        onClick={() => removeSelectedImage(image)}
                      >
                        <ClearRoundedIcon
                          sx={{ width: 16, height: 16, color: "black" }}
                        />
                      </IconButton>
                      <img
                        src={URL.createObjectURL(image)}
                        style={{
                          objectFit: "cover",
                          width: "48px",
                          height: "48px",
                          borderRadius: 7,
                        }}
                      />
                    </Box>
                  ))}
                  {Array.from(
                    { length: selectedImagesLength - selectedImages.length },
                    (_, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width="48px"
                          height="48px"
                          animation="wave"
                        />
                      </Box>
                    )
                  )}
                </Box>
              )}
              <InputBase
                placeholder="Aa"
                inputRef={messageInputRef}
                onChange={handleInputChange}
                multiline
                maxRows={3}
                autoFocus
                required
                error={!isMessageValid}
                inputProps={{ maxLength: 1000, spellCheck: false }}
                sx={{
                  flex: 1,
                  padding: 2,
                }}
              />
            </Box>
            <button
              onClick={() => void handleMessageSubmit()}
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
});

export default Messaging;
