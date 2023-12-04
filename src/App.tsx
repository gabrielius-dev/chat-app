import { Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import axios, { AxiosResponse } from "axios";
import { User, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/UtilityComponents/LoadingScreen";
import Messaging from "./components/Messaging/Messaging";
import { useContext, useEffect, useState } from "react";
import WindowFocusContext from "./context/WindowsFocusContext";
import { Box } from "@mui/material";
import Error from "./components/Error/Error";
import socket from "./socket/socket";
import Index from "./components/Index/Index";

function App() {
  const isWindowFocused = useContext(WindowFocusContext);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const getUser = async () => {
    const response: AxiosResponse<UserResponse> = await axios.get(
      "http://localhost:8000/user",
      {
        withCredentials: true,
      }
    );
    return response.data.user;
  };

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
          <Routes>
            <Route
              path="/"
              element={<Index isSocketConnected={isSocketConnected} />}
            />
            {user && (
              <Route
                path="/messages/:selectedUserId"
                element={<Messaging isSocketConnected={isSocketConnected} />}
              />
            )}
            <Route path="*" element={<Error errorMessage="Page not found" />} />
          </Routes>
        </>
      )}
      {isLoading && <LoadingScreen />}
    </Box>
  );
}

export default App;
