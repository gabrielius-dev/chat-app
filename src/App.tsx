import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import axios, { AxiosResponse } from "axios";
import { User as UserType, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/UtilityComponents/LoadingScreen";
import { useEffect, useState, useCallback } from "react";
import { Box, useTheme, useMediaQuery, AlertColor } from "@mui/material";
import Error from "./components/Error/Error";
import socket from "./socket/socket";
import Index from "./components/Index/Index";
import Sidebar from "./components/Sidebar/Sidebar";
import GroupChatWrapper from "./components/GroupChat/GroupChatWrapper";
import MessagingWrapper from "./components/Messaging/MessagingWrapper";
import { ChatProvider } from "./context/ChatProvider";
import AlertNotification from "./components/UtilityComponents/AlertNotification";
import { GroupChatWithoutLatestMessage } from "./components/types/Chat";
import UserWrapper from "./components/User/UserWrapper";

function App() {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const [open, setOpen] = useState(isSmallScreen);
  const [openAlertNotification, setOpenAlertNotification] = useState(false);
  const [alertNotificationMessage, setAlertNotificationMessage] = useState("");
  const [alertNotificationType, setAlertNotificationType] =
    useState<AlertColor>("info");

  const toggleSidebar = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const getUser = useCallback(async () => {
    const response: AxiosResponse<UserResponse> = await axios.get(
      `${import.meta.env.VITE_BACK_END_URL}/user`,
      {
        withCredentials: true,
      }
    );
    return response.data.user;
  }, []);

  const { data: user, isLoading } = useQuery<UserType, Error>({
    queryKey: ["userData"],
    queryFn: getUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (user) {
      const handleSocketConnect = () => {
        setIsSocketConnected(true);
      };

      socket.connect();
      socket.on("connect", handleSocketConnect);

      return () => {
        socket.off("connect", handleSocketConnect);
        socket.disconnect();
      };
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    function handleGroupChatRemoved({ message }: { message: string }) {
      setAlertNotificationType("error");
      setAlertNotificationMessage(message);
      setOpenAlertNotification(true);
    }

    socket.on("group-chat-removed", handleGroupChatRemoved);

    function handleGroupChatDeleted({
      message,
      groupChat,
    }: {
      message: string;
      groupChat: GroupChatWithoutLatestMessage;
    }) {
      if (groupChat.creator === user?._id)
        setAlertNotificationMessage(
          `The group chat '${groupChat.name}' has been deleted successfully.`
        );
      else setAlertNotificationMessage(message);
      setAlertNotificationType("info");
      setOpenAlertNotification(true);
    }

    socket.on("group-chat-deleted", handleGroupChatDeleted);

    return () => {
      socket.off("group-chat-removed", handleGroupChatRemoved);
      socket.off("group-chat-deleted", handleGroupChatDeleted);
    };
  }, [user?._id]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {!isLoading && (
        <>
          {openAlertNotification && (
            <AlertNotification
              message={alertNotificationMessage}
              type={alertNotificationType}
              open={openAlertNotification}
              setOpen={setOpenAlertNotification}
            />
          )}
          {user && <Header />}
          <ChatProvider>
            <Box
              sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
              }}
            >
              {user && location.pathname !== "/" && (
                <Sidebar
                  toggleSidebar={toggleSidebar}
                  open={open}
                  isSmallScreen={isSmallScreen}
                />
              )}
              <Routes>
                <Route
                  path="/"
                  element={<Index isSocketConnected={isSocketConnected} />}
                />
                {user && (
                  <>
                    <Route
                      path="/messages/:selectedUserId"
                      element={
                        <MessagingWrapper
                          isSocketConnected={isSocketConnected}
                          open={open}
                          setOpen={setOpen}
                        />
                      }
                    />
                    <Route
                      path="/group-chat/:chatId"
                      element={
                        <GroupChatWrapper
                          isSocketConnected={isSocketConnected}
                          open={open}
                          setOpen={setOpen}
                        />
                      }
                    />
                    <Route
                      path="/user/:id"
                      element={<UserWrapper open={open} setOpen={setOpen} />}
                    />
                  </>
                )}
                <Route
                  path="/user-not-found"
                  element={
                    <Error
                      errorMessage="User not found"
                      open={open}
                      setOpen={setOpen}
                    />
                  }
                />
                <Route
                  path="/group-chat-not-found"
                  element={
                    <Error
                      errorMessage="Group chat not found"
                      open={open}
                      setOpen={setOpen}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <Error
                      errorMessage="Page not found"
                      open={open}
                      setOpen={setOpen}
                    />
                  }
                />
              </Routes>
            </Box>
          </ChatProvider>
        </>
      )}
      {isLoading && <LoadingScreen />}
    </Box>
  );
}

export default App;
