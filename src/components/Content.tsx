import {
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import WelcomeBox from "./GuestComponents/WelcomeBox";
import Login from "./GuestComponents/Login";
import { useEffect, useState } from "react";
import { UserInterface, UserResponse } from "./types/User";
import SignUp from "./GuestComponents/SignUp";
import axios, { AxiosResponse } from "axios";

function Content() {
  const theme = useTheme();
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState<UserInterface | null>(null);
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: AxiosResponse<UserResponse> = await axios.get(
          "http://localhost:8000/user",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
      } catch (err) {
        /* empty */
      }
    };

    void fetchUser();
  }, []);

  return (
    <>
      {!user && (
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
              {showLogin && (
                <>
                  <Login setUser={setUser} />
                  <Typography sx={{ textAlign: "center" }}>
                    {"Don't"} have an account?{" "}
                    <Link
                      sx={{ color: theme.deepBlue, fontWeight: "bold" }}
                      href="#"
                      underline="none"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLogin(false);
                      }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </>
              )}
              {!showLogin && (
                <>
                  <SignUp setUser={setUser} />
                  <Typography sx={{ textAlign: "center" }}>
                    Already have an account?{" "}
                    <Link
                      sx={{ color: theme.deepBlue, fontWeight: "bold" }}
                      href="#"
                      underline="none"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLogin(true);
                      }}
                    >
                      Login
                    </Link>
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
}

export default Content;
