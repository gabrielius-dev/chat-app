import {
  Alert,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import { User } from "../types/User";
import { Link, useNavigate } from "react-router-dom";
import { Fragment, useState, memo } from "react";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as PopupStateType } from "material-ui-popup-state/hooks";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const Header = memo(function Header() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const user: User = queryClient.getQueryData(["userData"])!;
  const navigate = useNavigate();

  async function handleLogout(popupState: PopupStateType) {
    try {
      await axios.post(
        "http://localhost:8000/logout",
        {},
        {
          withCredentials: true,
        }
      );
      navigate("/");
      queryClient.setQueryData(["userData"], null);
    } catch (err) {
      setOpen(true);
    }

    popupState.close();
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        p: 1,
        borderBottom: `1px solid ${theme.lightGray}`,

        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Link to="/">
        <svg
          width="50px"
          height="50px"
          viewBox="-2.4 -2.4 28.80 28.80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#1C768F"
          transform="rotate(0)"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0" />

          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <g id="SVGRepo_iconCarrier">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
              stroke="#1C274C"
              strokeWidth="1.5"
            />
            <path
              d="M8 10.5H16"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 14H13.5"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </Link>
      <Link to="/">
        <Typography variant="h5" sx={{ color: theme.midnightNavy }}>
          Chat app
        </Typography>
      </Link>
      <div style={{ marginLeft: "auto" }}>
        <PopupState
          variant="popover"
          popupId="popup-menu"
          disableAutoFocus={true}
        >
          {(popupState) => (
            <Fragment>
              <Avatar
                alt="Profile picture"
                src={user?.img}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.midnightNavy,
                  cursor: "pointer",
                }}
                {...bindTrigger(popupState)}
                data-testid="popup-open"
              >
                {!user?.img ? user?.username[0].toUpperCase() : null}
              </Avatar>
              <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={popupState.close}>
                  <Link to={`/user/${user?._id}`}>My account</Link>
                </MenuItem>
                <MenuItem onClick={() => void handleLogout(popupState)}>
                  Logout
                </MenuItem>
              </Menu>
            </Fragment>
          )}
        </PopupState>
      </div>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          An error occurred during logout. Please try again later.
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default Header;
