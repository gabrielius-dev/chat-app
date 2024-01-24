import { Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import Chat from "../../assets/illustrations/chat.svg";

type handleImageLoadType = () => void;

function WelcomeBox({
  handleImageLoad,
}: {
  handleImageLoad: handleImageLoadType;
}) {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid
      item
      md={6}
      xs={12}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: isMediumScreen ? "initial" : "center",
        alignItems: isMediumScreen ? "initial" : "center",
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
        <Link to="/">Chat app</Link>
      </Typography>
      <img
        src={Chat}
        onLoad={handleImageLoad}
        alt="Chat Logo"
        style={{ maxWidth: "60vw" }}
      />
      <Typography
        variant="body1"
        sx={{
          color: theme.midnightNavy,
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        Welcome to the real-time messaging platform! Connect instantly with
        friends and enjoy seamless communication. Let the conversations begin!
      </Typography>
    </Grid>
  );
}

export default WelcomeBox;
