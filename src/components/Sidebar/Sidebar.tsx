import { Box, IconButton, Typography, useTheme } from "@mui/material";
import ChatList from "../UtilityComponents/ChatList";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { memo } from "react";

type toggleSidebarType = () => void;

const Sidebar = memo(function Sidebar({
  toggleSidebar,
  open,
  isSmallScreen,
}: {
  toggleSidebar: toggleSidebarType;
  open: boolean;
  isSmallScreen: boolean;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        width: open ? (!isSmallScreen ? "100vw" : "50vw") : "max-content",
        maxWidth: !isSmallScreen ? "600px" : "500px",
        borderRight: `1px solid ${theme.lightGray}`,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: open ? `1px solid ${theme.lightGray}` : undefined,
          p: 1,
        }}
      >
        {open && (
          <Typography variant="h5" sx={{ color: theme.midnightNavy }}>
            Chat list
          </Typography>
        )}

        <IconButton sx={{ ml: "auto" }} onClick={toggleSidebar}>
          <PeopleRoundedIcon
            sx={{ color: theme.midnightNavy, width: 35, height: 35 }}
          />
        </IconButton>
      </Box>
      <Box sx={{ overflow: "auto", display: open ? "block" : "none" }}>
        <ChatList />
      </Box>
    </Box>
  );
});

export default Sidebar;
