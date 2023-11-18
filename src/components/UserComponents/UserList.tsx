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
} from "@mui/material";
import TimeAgo from "react-timeago";

type OnUserClickType = (user: User) => void;

const UserList = memo(function UserList({
  user,
  onUserClick,
}: {
  user: User;
  onUserClick: OnUserClickType;
}) {
  const theme = useTheme();
  const [userList, setUserList] = useState<User[] | []>([]);
  const [loadOffset, setLoadOffset] = useState(1);
  const [moreUsersExist, setMoreUsersExist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [loadOffset, user._id]);

  const loadMoreUsers = () =>
    setLoadOffset((currentLoadOffset) => currentLoadOffset + 1);

  return (
    !isLoading && (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 2,
        }}
      >
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {userList.map((listUser) => (
            <ListItem key={listUser._id} disablePadding>
              <ListItemButton onClick={() => onUserClick(listUser)}>
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
                          listUser.latestMessage?.message?.length > 20
                            ? listUser.latestMessage.message.slice(0, 20) +
                              "..."
                            : listUser.latestMessage.message
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
          ))}
        </List>
        {moreUsersExist && (
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
    )
  );
});

export default UserList;
