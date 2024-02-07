import { Box, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../types/User";
import Main from "./Main";
import NoChatsSelected from "../UtilityComponents/NoChatsSelected";

function Index({
  isSocketConnected,
  open,
  isSmallScreen,
}: {
  isSocketConnected: boolean;
  open: boolean;
  isSmallScreen: boolean;
}) {
  const queryClient = useQueryClient();
  const user: User | undefined = queryClient.getQueryData(["userData"]);

  return (
    <Box sx={{ width: "100vw", overflow: "auto" }}>
      {!user && <Main />}
      {user && isSocketConnected && (
        <Box
          sx={{
            display: open && !isSmallScreen ? "none" : "flex",
            height: "100%",
            overflow: "hidden",
          }}
        >
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
    </Box>
  );
}

export default Index;
