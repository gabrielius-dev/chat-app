import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import WelcomeBox from "./GuestComponents/WelcomeBox";
import Login from "./GuestComponents/Login";
import { useState } from "react";
import { UserResponse } from "./types/User";
import SignUp from "./GuestComponents/SignUp";
import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";

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

  const { data: user, isLoading } = useQuery({
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
                  {showLogin && (
                    <>
                      <Login />
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
                      <SignUp />
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
          {user && <p>{user.username}</p>}
        </>
      )}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <ClipLoader
            loading={isLoading}
            size={"20vw"}
            color={theme.deepBlue}
          />
        </Box>
      )}
    </>
  );
}

export default Content;
