import {
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { UserInterface, UserResponse } from "./types/User";
import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./LoadingScreen";
import WelcomeBox from "./GuestComponents/WelcomeBox";
import Login from "./GuestComponents/Login";
import SignUp from "./GuestComponents/SignUp";
import Header from "./UserComponents/Header";

function Content() {
  const theme = useTheme();
  const [showLogin, setShowLogin] = useState(true);
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  const getUser = async () => {
    const response: AxiosResponse<UserResponse> = await axios.get(
      "http://localhost:8000/user",
      {
        withCredentials: true,
      }
    );
    return response.data.user;
  };

  const { data: user, isLoading } = useQuery<UserInterface, Error>({
    queryKey: ["userData"],
    queryFn: getUser,
    retry: false,
  });

  return (
    <>
      {!isLoading && (
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
                  {showLogin && <Login />}
                  {!showLogin && <SignUp />}
                  <Typography sx={{ textAlign: "center" }}>
                    {showLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
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
          )}
          {user && <Header user={user} />}
        </>
      )}
      {isLoading && <LoadingScreen />}
    </>
  );
}

export default Content;
