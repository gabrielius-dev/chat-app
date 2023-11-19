import { Route, Routes } from "react-router-dom";
import Header from "./components/UserComponents/Header";
import axios, { AxiosResponse } from "axios";
import { User, UserResponse } from "./components/types/User";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./components/Index";
import Messaging from "./components/Messaging";
import Sidebar from "./components/Sidebar";
import { useContext } from "react";
import WindowFocusContext from "./context/WindowsFocusContext";

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
    <>
      {!isLoading && (
        <>
          {user && (
            <>
              <Header />
              <Sidebar />
            </>
          )}
          <Routes>
            <Route path="/" element={<Index />} />
            {user && (
              <Route path="/messages/:selectedUserId" element={<Messaging />} />
            )}
          </Routes>
        </>
      )}
      {isLoading && <LoadingScreen />}
    </>
  );
}

export default App;
