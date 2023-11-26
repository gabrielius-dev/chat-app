import { useMediaQuery, Box } from "@mui/material";
import UserList from "./UserComponents/UserList";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "./types/User";
import { useTheme } from "@mui/material/styles";
import Main from "./GuestComponents/Main";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";

function Index() {
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
      {user && !isMediumScreen && <UserList />}
      {user && isMediumScreen && (
        <Box sx={{ display: "flex", height: "100%" }}>
          <Sidebar open={open} toggleSidebar={toggleSidebar} />
        </Box>
      )}
    </>
  );
}

export default Index;
