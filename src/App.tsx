import { Route, Routes } from "react-router-dom";
import Header from "./components/UserComponents/Header";
import axios, { AxiosResponse } from "axios";
import { User, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./components/Index";
import Messaging from "./components/Messaging";
import { useContext } from "react";
import WindowFocusContext from "./context/WindowsFocusContext";
import { Box } from "@mui/material";
import Error from "./components/Error";

function App() {
  const isWindowFocused = useContext(WindowFocusContext);

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
            <Route path="/" element={<Index />} />
            {user && (
              <Route path="/messages/:selectedUserId" element={<Messaging />} />
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
