import axios, { AxiosResponse } from "axios";
import { useEffect, useState, memo } from "react";
import { User } from "../types/User";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  useTheme,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../../socket/socket";

const MemoizedListItem = memo(function MemoizedListItem({
  listUser,
  user,
}: {
  listUser: User;
  user: User;
}) {
  const theme = useTheme();
  return (
    <Link to={`/messages/${listUser._id}`}>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemAvatar>
            <Avatar
              alt="Profile picture"
              src={listUser?.img}
              sx={{ width: 40, height: 40, bgcolor: theme.deepBlue }}
            >
              {!listUser?.img ? listUser?.username[0].toUpperCase() : null}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={listUser.username}
            secondary={
              listUser.latestMessage
                ? `${
                    listUser.latestMessage?.sender === user._id ? "You: " : ""
                  }${
                    listUser.latestMessage?.content?.length > 20
                      ? listUser.latestMessage.content.slice(0, 20) + "..."
                      : listUser.latestMessage.content
                  }`
                : `Say hi to ${listUser.username}!`
            }
          />
          {listUser.latestMessage?.createdAt && (
            <TimeAgo
              key={listUser.latestMessage?.createdAt}
              date={listUser.latestMessage?.createdAt}
              minPeriod={10}
              style={{ color: "rgba(0, 0, 0, 0.6)" }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Link>
  );
});

const UserList = memo(function UserList() {
  const theme = useTheme();
  const [userList, setUserList] = useState<User[] | []>([]);
  const [loadOffset, setLoadOffset] = useState(1);
  const [moreUsersExist, setMoreUsersExist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;

  useEffect(() => {
    setIsLoading(true);
    async function userListFetching() {
      const response: AxiosResponse<User[]> = await axios.get(
        "http://localhost:8000/userList",
        {
          params: { loadOffset },

          withCredentials: true,
        }
      );
      if (response.data.length < 10) setMoreUsersExist(false);
      return response.data;
    }

    userListFetching()
      .then((res) => {
        if (loadOffset === 1) setUserList(res);
        else setUserList((currentUserList) => [...currentUserList, ...res]);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, [loadOffset]);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", user._id);

    function getNewUserHandler(returnedUser: User) {
      setUserList((prevUserList) =>
        prevUserList.map((user) => {
          if (user._id === returnedUser._id) {
            return returnedUser;
          } else return user;
        })
      );
    }

    socket.on("get-new-user", getNewUserHandler);

    return () => {
      socket.off("get-user-list", getNewUserHandler);
      socket.disconnect();
    };
  }, [user._id]);

  const loadMoreUsers = () =>
    setLoadOffset((currentLoadOffset) => currentLoadOffset + 1);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        alignItems: "center",
      }}
    >
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {userList.map((listUser) => (
          <MemoizedListItem
            key={listUser._id}
            listUser={listUser}
            user={user}
          />
        ))}
      </List>
      {isLoading && <CircularProgress sx={{ color: theme.deepBlue }} />}
      {!isLoading && moreUsersExist && (
        <Button
          variant="outlined"
          sx={{
            color: theme.deepBlue,
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              border: 2,
            },
            borderRadius: 1,
            border: 2,
            marginX: 1,
          }}
          onClick={loadMoreUsers}
        >
          Load more
        </Button>
      )}
    </Box>
  );
});

export default UserList;
