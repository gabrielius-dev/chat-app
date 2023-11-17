import axios, { AxiosResponse } from "axios";
import { useEffect, useState, memo } from "react";
import { User, UserInterface } from "../types/User";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const UserList = memo(function UserList({ user }: { user: UserInterface }) {
  const [userList, setUserList] = useState<User[] | []>([]);
  const [loadOffset, setLoadOffset] = useState(1);

  useEffect(() => {
    async function initialUserListFetching() {
      const response: AxiosResponse<User[]> = await axios.get(
        "http://localhost:8000/userList",
        {
          params: { loadOffset },

          withCredentials: true,
        }
      );
      console.log(response.data);
      return response.data;
    }

    initialUserListFetching()
      .then((res) => setUserList(res))
      .catch((err) => console.error(err));
  }, [loadOffset, user._id]);

  return (
    <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      {userList.map((listUser) => (
        <ListItem key={listUser._id} disablePadding>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar
                alt="Profile picture"
                src={listUser?.img}
                sx={{ width: 40, height: 40 }}
              >
                {!listUser?.img ? listUser?.username[0].toUpperCase() : null}
              </Avatar>{" "}
            </ListItemAvatar>
            <ListItemText
              primary={listUser.username}
              secondary={
                listUser.latestMessage
                  ? `${
                      listUser.latestMessage?.sender === user._id ? "You: " : ""
                    }${
                      listUser.latestMessage?.message?.length > 20
                        ? listUser.latestMessage.message.slice(0, 20) + "..."
                        : listUser.latestMessage.message
                    }`
                  : `Say hi to ${listUser.username}!`
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
});

export default UserList;
