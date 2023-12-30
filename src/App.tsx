import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import axios, { AxiosResponse } from "axios";
import { User as UserType, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/UtilityComponents/LoadingScreen";
import { useContext, useEffect, useState, useCallback } from "react";
import WindowFocusContext from "./context/WindowsFocusContext";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Error from "./components/Error/Error";
import socket from "./socket/socket";
import Index from "./components/Index/Index";
import Sidebar from "./components/Sidebar/Sidebar";
import User from "./components/User/User";
import GroupChatWrapper from "./components/GroupChat/GroupChatWrapper";
import MessagingWrapper from "./components/Messaging/MessagingWrapper";
import { ChatProvider } from "./context/ChatProvider";

function App() {
  const isWindowFocused = useContext(WindowFocusContext);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const [open, setOpen] = useState(isSmallScreen);

  const toggleSidebar = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const getUser = useCallback(async () => {
    const response: AxiosResponse<UserResponse> = await axios.get(
      "http://localhost:8000/user",
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
    refetchInterval: isWindowFocused ? 1000 * 120 : false,
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
  }, [user]);

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
                      element={<User setOpen={setOpen} />}
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
