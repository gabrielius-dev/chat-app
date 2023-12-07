import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import axios, { AxiosResponse } from "axios";
import { User, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/UtilityComponents/LoadingScreen";
import Messaging from "./components/Messaging/Messaging";
import { useContext, useEffect, useState, useCallback } from "react";
import WindowFocusContext from "./context/WindowsFocusContext";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Error from "./components/Error/Error";
import socket from "./socket/socket";
import Index from "./components/Index/Index";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const isWindowFocused = useContext(WindowFocusContext);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const [open, setOpen] = useState(isSmallScreen);
  const [messagingUserExists, setMessagingUserExists] = useState(false);

  const toggleSidebar = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const memoizedSetOpen = useCallback(
    (value: boolean) => {
      setOpen(value);
    },
    [setOpen]
  );

  const getUser = useCallback(async () => {
    const response: AxiosResponse<UserResponse> = await axios.get(
      "http://localhost:8000/user",
      {
        withCredentials: true,
      }
    );
    return response.data.user;
  }, []);

  const { data: user, isLoading } = useQuery<User, Error>({
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
          <Box
            sx={{
              display: "flex",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {user &&
              location.pathname.startsWith("/messages/") &&
              messagingUserExists && (
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
                <Route
                  path="/messages/:selectedUserId"
                  element={
                    <Messaging
                      isSocketConnected={isSocketConnected}
                      open={open}
                      setOpen={memoizedSetOpen}
                      setMessagingUserExists={setMessagingUserExists}
                    />
                  }
                />
              )}
              <Route
                path="/user-not-found"
                element={<Error errorMessage="User not found" />}
              />
              <Route
                path="*"
                element={<Error errorMessage="Page not found" />}
              />
            </Routes>
          </Box>
        </>
      )}
      {isLoading && <LoadingScreen />}
    </Box>
  );
}

export default App;
