import {
  Avatar,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { UserInterface } from "../types/User";
import { Link } from "react-router-dom";
import { memo } from "react";

const Header = memo(function Header({ user }: { user: UserInterface }) {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{
        boxShadow: 1,
        p: 1,
        m: 1,
        borderRadius: 50,
        display: `${isMediumScreen ? "none" : "flex"}`,
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
        <Link to={user._id}>
          <Avatar
            alt="Profile picture"
            src={user?.img}
            sx={{ width: 40, height: 40 }}
          >
            {!user?.img ? user?.username[0].toUpperCase() : null}
          </Avatar>
        </Link>
      </div>
    </Box>
  );
});

export default Header;
