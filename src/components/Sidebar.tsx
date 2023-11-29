import { Box, IconButton, Typography, useTheme } from "@mui/material";
import UserList from "./UserComponents/UserList";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

type toggleSidebarType = () => void;

function Sidebar({
  toggleSidebar,
  open,
}: {
  toggleSidebar: toggleSidebarType;
  open: boolean;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: open ? "50vw" : "max-content",
        maxWidth: "500px",
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
            User list
          </Typography>
        )}

        <IconButton sx={{ ml: "auto" }} onClick={toggleSidebar}>
          <PeopleRoundedIcon
            sx={{ color: theme.midnightNavy, width: 35, height: 35 }}
          />
        </IconButton>
      </Box>
      <Box sx={{ overflow: "auto", display: open ? "block" : "none" }}>
        <UserList />
      </Box>
    </Box>
  );
}

export default Sidebar;