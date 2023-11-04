import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function WelcomeBox() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          color: theme.midnightNavy,
        }}
      >
        Chat app
      </Typography>
      <img src="src\assets\illustrations\chat.svg" />
      <Typography
        variant="body1"
        sx={{
          color: theme.midnightNavy,
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        Welcome to our chat community! Join the conversation or sign up to
        connect with friends and make new ones.
      </Typography>
    </Box>
  );
}

export default WelcomeBox;
