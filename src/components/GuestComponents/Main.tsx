import {
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import WelcomeBox from "./WelcomeBox";
import Login from "./Login";
import SignUp from "./SignUp";

function Main() {
  const theme = useTheme();
  const [showLogin, setShowLogin] = useState(true);
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "100vh",
        display: `${isMediumScreen ? "flex" : "block"}`,
        alignItems: "center",
        justifyContent: "center",
      }}
      component="main"
    >
      <Grid container sx={{ marginY: 2 }}>
        <WelcomeBox />

        <Grid
          item
          xs={true}
          md={6}
          sx={{
            boxShadow: 1,
            p: 2,
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            mb: `${isMediumScreen ? 0 : 4}`,
          }}
        >
          {showLogin && <Login />}
          {!showLogin && <SignUp />}
          <Typography sx={{ textAlign: "center" }}>
            {showLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              sx={{ color: theme.deepBlue, fontWeight: "bold" }}
              href="#"
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                setShowLogin(!showLogin);
              }}
            >
              {showLogin ? "Sign up" : "Login"}
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Main;
