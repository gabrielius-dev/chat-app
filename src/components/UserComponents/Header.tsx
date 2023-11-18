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
import { Link } from "react-router-dom";
import { Fragment, useState } from "react";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as PopupStateType } from "material-ui-popup-state/hooks";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

function Header() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const user: User | undefined = queryClient.getQueryData(["userData"]);

  async function handleLogout(popupState: PopupStateType) {
    try {
      await axios.post(
        "http://localhost:8000/logout",
        {},
        {
          withCredentials: true,
        }
      );
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
        boxShadow: 1,
        p: 1,
        m: 1,
        borderRadius: 50,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Link to="/">
        <img src="src\assets\illustrations\chat-logo.svg" width={"50px"} />
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
                  bgcolor: theme.deepBlue,
                  cursor: "pointer",
                }}
                {...bindTrigger(popupState)}
                data-testid="popup-open"
              >
                {!user?.img ? user?.username[0].toUpperCase() : null}
              </Avatar>
              <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={popupState.close}>
                  <Link to="/profile">My account</Link>
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
}

export default Header;
