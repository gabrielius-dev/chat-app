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
          <Link key={listUser._id} to={`/messages/${listUser._id}`}>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar
                    alt="Profile picture"
                    src={listUser?.img}
                    sx={{ width: 40, height: 40, bgcolor: theme.deepBlue }}
                  >
                    {!listUser?.img
                      ? listUser?.username[0].toUpperCase()
                      : null}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={listUser.username}
                  secondary={
                    listUser.latestMessage
                      ? `${
                          listUser.latestMessage?.sender === user._id
                            ? "You: "
                            : ""
                        }${
                          listUser.latestMessage?.content?.length > 20
                            ? listUser.latestMessage.content.slice(0, 20) +
                              "..."
                            : listUser.latestMessage.content
                        }`
                      : `Say hi to ${listUser.username}!`
                  }
                />
                {listUser.latestMessage?.createdAt && (
                  <TimeAgo
                    date={listUser.latestMessage?.createdAt}
                    minPeriod={60}
                    style={{ color: "rgba(0, 0, 0, 0.6)" }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Link>
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
