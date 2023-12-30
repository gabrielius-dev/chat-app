import axios, { AxiosResponse } from "axios";
import { useEffect, useState, memo, ChangeEvent, useCallback } from "react";
import { User } from "../types/User";
import {
  Avatar,
  useTheme,
  Box,
  CircularProgress,
  FormGroup,
  Checkbox,
  FormControlLabel,
  Theme,
  Typography,
  CheckboxProps,
  styled,
  Button,
  InputBase,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 3,
  width: 16,
  height: 16,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgb(16 22 26 / 40%)"
      : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "#f5f8fa",
  backgroundImage:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
      : "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background:
      theme.palette.mode === "dark"
        ? "rgba(57,75,89,.5)"
        : "rgba(206,217,224,.5)",
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#032539",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&:before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "#032539",
  },
});

function BpCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      sx={{
        "&:hover": { bgcolor: "transparent" },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

const CustomLabel = ({
  username,
  img,
  theme,
}: {
  username: string;
  img: string | undefined;
  theme: Theme;
}) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <Avatar
      alt="Profile picture"
      src={img}
      sx={{
        width: 50,
        height: 50,
        bgcolor: theme.midnightNavy,
      }}
    >
      {!img ? username[0].toUpperCase() : null}
    </Avatar>
    <span style={{ marginLeft: 8 }}>{username}</span>
  </div>
);

type setSelectedUserListType = React.Dispatch<React.SetStateAction<string[]>>;

const UserList = memo(function UserList({
  setSelectedUserList,
  errorMessage,
  selectedUserList,
  prevSelectedUserList,
  excludeUser,
}: {
  setSelectedUserList: setSelectedUserListType;
  errorMessage: string;
  selectedUserList: string[];
  prevSelectedUserList: string[] | null;
  excludeUser: string;
}) {
  const theme = useTheme();
  const [userList, setUserList] = useState<User[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadOffset, setLoadOffset] = useState(1);
  const [moreUsersExist, setMoreUsersExist] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const fetchUserList = useCallback(async () => {
    const response: AxiosResponse<User[]> = await axios.get(
      "http://localhost:8000/user-list",
      {
        params: {
          loadOffset,
          username: searchValue,
          userList: prevSelectedUserList,
          excludeUser,
        },

        withCredentials: true,
      }
    );

    setMoreUsersExist(response.data.length === 10);

    return response.data;
  }, [excludeUser, loadOffset, prevSelectedUserList, searchValue]);

  useEffect(() => {
    if (searchValue !== "") return;
    setIsLoading(true);

    fetchUserList()
      .then((res) => {
        setUserList(res);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, [fetchUserList, searchValue]);

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedUserList((prevList) => [...prevList, e.target.name]);
    } else {
      setSelectedUserList((prevList) =>
        prevList.filter((user) => user !== e.target.name)
      );
    }
  }

  useEffect(() => {
    setLoadOffset(1);
  }, [searchValue]);

  useEffect(() => {
    if (searchValue === "") return;

    setIsLoading(true);
    const getData = setTimeout(() => {
      fetchUserList()
        .then((res) => {
          setUserList(res);
          setIsLoading(false);
        })
        .catch((err) => console.error(err));
    }, 500);

    return () => clearTimeout(getData);
  }, [fetchUserList, searchValue]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        alignItems: "center",
        width: "100%",
      }}
    >
      <Typography variant="h5">User list</Typography>
      <Typography
        sx={{
          color: "#f44336",
          visibility: `${errorMessage ? "visible" : "hidden"}`,
          textAlign: "center",
        }}
      >
        <WarningRoundedIcon />
        {errorMessage}
      </Typography>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          border: `1px solid rgba(0, 0, 0, 0.23)`,
          borderRadius: 10,
          mb: 1,
          p: 1,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, color: "rgba(0, 0, 0, 0.87)" }}
          placeholder="Search for users"
          inputProps={{ "aria-label": "search users" }}
          value={searchValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxHeight: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <FormGroup
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: 1,
          }}
        >
          {userList.map((user) => (
            <FormControlLabel
              sx={{ width: "100%" }}
              key={user._id}
              control={
                <BpCheckbox
                  onChange={handleCheckboxChange}
                  name={user._id}
                  sx={{ ml: 1 }}
                  checked={selectedUserList.includes(user._id)}
                />
              }
              label={
                <CustomLabel
                  username={user.username}
                  theme={theme}
                  img={user?.img}
                />
              }
            />
          ))}
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
                marginX: "-8px",
              }}
              onClick={() =>
                setLoadOffset((prevLoadOffset) => prevLoadOffset + 1)
              }
            >
              Load more
            </Button>
          )}
        </FormGroup>
        {userList.length === 0 && !isLoading && (
          <Typography sx={{ textAlign: "center" }} variant="h5">
            No matching users found.
          </Typography>
        )}
        {isLoading && <CircularProgress sx={{ color: theme.deepBlue }} />}
      </Box>
    </Box>
  );
});

export default UserList;
