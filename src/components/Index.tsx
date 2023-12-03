import { useMediaQuery, Box, Typography } from "@mui/material";
import UserList from "./UserComponents/UserList";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "./types/User";
import { useTheme } from "@mui/material/styles";
import Main from "./GuestComponents/Main";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import NoChatsSelected from "./UserComponents/NoChatsSelected";

function Index({ isSocketConnected }: { isSocketConnected: boolean }) {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
  const queryClient = useQueryClient();
  const user: User | undefined = queryClient.getQueryData(["userData"]);
  const [open, setOpen] = useState(isMediumScreen);

  const toggleSidebar = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    setOpen(isMediumScreen);
  }, [isMediumScreen]);

  return (
    <>
      {!user && <Main />}
      {user && !isMediumScreen && isSocketConnected && <UserList />}
      {user && isMediumScreen && isSocketConnected && (
        <Box
          sx={{
            display: "flex",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Sidebar
            open={open}
            toggleSidebar={toggleSidebar}
            isSmallScreen={true}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              p: 2,
            }}
          >
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              No chats selected
            </Typography>
            <NoChatsSelected />
          </Box>
        </Box>
      )}
    </>
  );
}

export default Index;
