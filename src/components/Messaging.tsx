import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Box, Typography, useTheme } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import { DatabaseUserResponse, User } from "./types/User";
import TimeAgo from "react-timeago";
import WindowFocusContext from "../context/WindowsFocusContext";

function Messaging() {
  const theme = useTheme();
  const { selectedUserId } = useParams();
  const isWindowFocused = useContext(WindowFocusContext);

  async function getDatabaseUser() {
    const response: AxiosResponse<DatabaseUserResponse> = await axios.get(
      `http://localhost:8000/user/${selectedUserId}`,
      { withCredentials: true }
    );
    return response.data.user;
  }

  const {
    data: selectedUser,
    isLoading,
    isFetching,
  } = useQuery<User | undefined, Error>({
    queryKey: ["databaseUserData"],
    queryFn: getDatabaseUser,
    retry: false,
    refetchInterval: isWindowFocused ? 1000 * 60 : false,
  });

  return (
    !isLoading &&
    !isFetching &&
    selectedUser && (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          my: 2,
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
      </Box>
    )
  );
}

export default Messaging;
