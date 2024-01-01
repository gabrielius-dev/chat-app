import axios, { AxiosResponse } from "axios";
import { GroupMessageInterface } from "../types/Message";
import {
  Avatar,
  Box,
  Typography,
  useTheme,
  InputBase,
  useMediaQuery,
  IconButton,
  MenuItem,
  Menu,
  Dialog,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions,
  AlertColor,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  SetStateAction,
  Dispatch,
  memo,
  Fragment,
} from "react";
import { User } from "../types/User";
import socket from "../../socket/socket";
import LoadingScreen from "../UtilityComponents/LoadingScreen";
import {
  GroupChatResponse,
  GroupChatWithoutLatestMessage,
} from "../types/Chat";
import Messages from "./Messages";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as PopupStateType } from "material-ui-popup-state/hooks";
import EditGroupForm from "./EditGroupForm";
import AlertNotification from "../UtilityComponents/AlertNotification";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const GroupChat = memo(function GroupChat({
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
  const { chatId } = useParams();
  const [message, setMessage] = useState("");
  const roomId = chatId;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialMessageFetching, setInitialMessageFetching] = useState(true);
  const [skipAmount, setSkipAmount] = useState(0);
  const [moreMessagesExist, setMoreMessagesExist] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<GroupMessageInterface[]>([]);
  const [newMessageAdded, setNewMessageAdded] = useState(false);
  const [isMessageValid, setIsMessageValid] = useState(true);
  const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [moreMessagesShowed, setMoreMessagesShowed] = useState(true);
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();
  const [groupChat, setGroupChat] =
    useState<GroupChatWithoutLatestMessage | null>();
  const [showEditGroupChat, setShowEditGroupChat] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [openAlertNotification, setOpenAlertNotification] = useState(false);
  const [alertNotificationMessage, setAlertNotificationMessage] = useState("");
  const [alertNotificationType, setAlertNotificationType] =
    useState<AlertColor>("info");

  useEffect(() => {
    setIsLoadingGroupChat(true);
    async function fetchGroupChat() {
      const response: AxiosResponse<GroupChatResponse> = await axios.get(
        `http://localhost:8000/group-chat/${chatId}`,
        { withCredentials: true }
      );

      return response.data.groupChat;
    }

    fetchGroupChat()
      .then((res) => setGroupChat(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingGroupChat(false));
  }, [chatId]);

  useEffect(() => {
    setOpen(isSmallScreen);
  }, [isSmallScreen, setOpen]);

  useEffect(() => {
    setTimeout(() => {
      setShowLoadingScreen(true);
    }, 1000);
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 0);
  };

  const addNewMessage = useCallback((newMessage: GroupMessageInterface) => {
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
    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  useEffect(() => {
    function handleEditGroupChat(groupChat: GroupChatWithoutLatestMessage) {
      if (groupChat.users.includes(user._id)) setGroupChat(groupChat);
      else {
        navigate("/");
      }
    }

    socket.on("receive-edit-group-chat", handleEditGroupChat);

    function handleDeleteGroupChat(groupChat: GroupChatWithoutLatestMessage) {
      if (groupChat.users.includes(user._id)) navigate("/");
    }

    socket.on("receive-delete-group-chat", handleDeleteGroupChat);

    return () => {
      socket.off("receive-edit-group-chat", handleEditGroupChat);
      socket.off("receive-delete-group-chat", handleDeleteGroupChat);
    };
  }, [navigate, user._id]);

  useEffect(() => {
    if (!groupChat && messages.length === 0) return;

    function messageDeletedHandler(message: GroupMessageInterface) {
      setMessages((previousMessages) =>
        previousMessages.filter(
          (prevMessage) => prevMessage._id !== message._id
        )
      );
    }

    socket.on("group-message-deleted", messageDeletedHandler);
    return () => {
      socket.off("group-message-deleted", messageDeletedHandler);
    };
  }, [messages, groupChat]);

  useEffect(() => {
    function handleMessageError({ message }: { message: string }) {
      setAlertNotificationMessage(message);
      setAlertNotificationType("error");
      setOpenAlertNotification(true);
    }

    socket.on("group-message-error", handleMessageError);
    return () => {
      socket.off("group-message-error", handleMessageError);
    };
  }, []);

  useEffect(() => {
    const receiveMessageHandler = (message: GroupMessageInterface) => {
      addNewMessage(message);
    };
    socket.on("receive-group-message", receiveMessageHandler);

    return () => {
      socket.off("receive-group-message", receiveMessageHandler);
    };
  }, [addNewMessage]);

  useEffect(() => {
    if (!isLoadingGroupChat && groupChat) {
      const fetchMessages = async () => {
        const res: AxiosResponse<GroupMessageInterface[]> = await axios.get(
          "http://localhost:8000/group-messages",
          {
            params: {
              groupChat: groupChat._id,
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
        });

      return () => {
        setInitialMessageFetching(false);
      };
    }
  }, [groupChat, isLoadingGroupChat]);

  // For the first load scroll to the bottom after messages are loaded
  useEffect(() => {
    if (!isInitialMessageFetching && skipAmount === 0) {
      scrollToBottom();
    }
  }, [isInitialMessageFetching, skipAmount]);

  const fetchMoreMessages = useCallback(async () => {
    const res: AxiosResponse<GroupMessageInterface[]> = await axios.get(
      "http://localhost:8000/group-messages",
      {
        params: {
          groupChat: chatId,
          skipAmount: skipAmount + 30,
        },
        withCredentials: true,
      }
    );
    return res.data;
  }, [skipAmount, chatId]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (
      messagesContainer &&
      messages.length &&
      groupChat &&
      moreMessagesExist &&
      !newMessageAdded
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
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }, [
    fetchMoreMessages,
    messages.length,
    moreMessagesExist,
    groupChat,
    newMessageAdded,
  ]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop === 0 && moreMessagesExist) {
        setPrevScrollHeight(e.currentTarget.scrollHeight);

        fetchMoreMessages()
          .then((messages) => {
            setMessages((prevMessages) => [...messages, ...prevMessages]);
            setMoreMessagesExist(messages.length === 30);
            setMoreMessagesShowed(false);
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
      !newMessageAdded &&
      !moreMessagesShowed
    ) {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight - prevScrollHeight;
      setMoreMessagesShowed(true);
    }
  }, [messages.length, moreMessagesShowed, newMessageAdded, prevScrollHeight]);

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
      socket.emit("send-group-message", message, user._id, chatId, roomId);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!groupChat && !isLoadingGroupChat) {
      navigate("/group-chat-not-found");
    }
  }, [groupChat, isLoadingGroupChat, navigate]);

  function handleEdit(popupState: PopupStateType) {
    setShowEditGroupChat(true);
    popupState.close();
  }

  function handleOpenDeleteConfirmation(popupState: PopupStateType) {
    popupState.close();
    setShowDeleteConfirmation(true);
  }

  function handleCloseDeleteConfirmation() {
    setShowDeleteConfirmation(false);
  }

  async function deleteGroupChat() {
    if (!groupChat) return;

    const response: AxiosResponse = await axios.delete(
      `http://localhost:8000/group-chat/${groupChat._id}`,
      { withCredentials: true }
    );

    if (response.status === 204) {
      socket.emit("delete-group-chat", groupChat);
    }
  }

  return (
    <>
      {!isInitialMessageFetching && isSocketConnected && groupChat && (
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
          {showEditGroupChat && (
            <EditGroupForm
              setShowGroupForm={setShowEditGroupChat}
              groupChat={groupChat}
            />
          )}
          <Dialog
            open={showDeleteConfirmation}
            onClose={() => void handleCloseDeleteConfirmation()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this group chat? This action
                cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleCloseDeleteConfirmation()}>
                Cancel
              </Button>
              <Button onClick={() => void deleteGroupChat()} autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
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
            <Avatar
              alt="Profile picture"
              src={groupChat.image ?? undefined}
              sx={{
                width: 50,
                height: 50,
                bgcolor: theme.midnightNavy,
              }}
            >
              {!groupChat?.image ? groupChat.name[0].toUpperCase() : null}
            </Avatar>
            <Box>
              <Box sx={{ maxWidth: "max-content" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", wordBreak: "break-all" }}
                >
                  {groupChat.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Members count: {groupChat.users.length}
                </Typography>
              </Box>
            </Box>
            <div style={{ marginLeft: "auto" }}>
              <PopupState
                variant="popover"
                popupId="popup-menu"
                disableAutoFocus={true}
              >
                {(popupState) => (
                  <Fragment>
                    <IconButton
                      aria-label="edit"
                      {...bindTrigger(popupState)}
                      data-testid="popup-open"
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu {...bindMenu(popupState)}>
                      <MenuItem onClick={() => void handleEdit(popupState)}>
                        Edit
                      </MenuItem>
                      {groupChat.creator === user._id && (
                        <MenuItem
                          onClick={() =>
                            void handleOpenDeleteConfirmation(popupState)
                          }
                        >
                          Delete
                        </MenuItem>
                      )}
                    </Menu>
                  </Fragment>
                )}
              </PopupState>
            </div>
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
      {isLoadingGroupChat && isInitialMessageFetching && showLoadingScreen && (
        <LoadingScreen />
      )}
    </>
  );
});

export default GroupChat;
