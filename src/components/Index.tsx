import { useMediaQuery } from "@mui/material";
import UserList from "./UserComponents/UserList";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "./types/User";
import { useTheme } from "@mui/material/styles";
import Main from "./GuestComponents/Main";

function Index() {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
  const queryClient = useQueryClient();
  const user: User | undefined = queryClient.getQueryData(["userData"]);

  return (
    <>
      {!user && <Main />}
      {user && !isMediumScreen && <UserList />}
    </>
  );
}

export default Index;
