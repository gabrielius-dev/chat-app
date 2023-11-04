import { Box, Container, GlobalStyles, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import WelcomeBox from "./GuestComponents/WelcomeBox";
import Login from "./GuestComponents/Login";
import { useState } from "react";

function Content() {
  const theme = useTheme();
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
      <GlobalStyles styles={{ body: { backgroundColor: theme.creamy } }} />
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          height: "100vh",
        }}
        component="main"
      >
        <WelcomeBox />
        <Box
          sx={{
            boxShadow: 1,
            p: 2,
            borderRadius: 1,
            bgcolor: theme.creamy,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {showLogin && (
            <>
              <Login />
              <Typography>
                {"Don't"} have an account?{" "}
                <Link
                  sx={{ color: theme.deepBlue, fontWeight: "bold" }}
                  href="#"
                  underline="none"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLogin(!showLogin);
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}

export default Content;
