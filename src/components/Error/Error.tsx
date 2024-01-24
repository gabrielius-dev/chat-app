import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import PageNotFound from "../../assets/illustrations/page-not-found.svg";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type setOpenType = Dispatch<SetStateAction<boolean>>;

function Error({
  errorMessage,
  open,
  setOpen,
}: {
  errorMessage: string;
  open: boolean;
  setOpen: setOpenType;
}) {
  const [timeLeft, setTimeLeft] = useState(5);
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    setOpen(isSmallScreen);
  }, [isSmallScreen, setOpen]);

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerIntervalRef.current);
      navigate("/");
    }
  }, [navigate, timeLeft]);

  return (
    <Box
      sx={{
        display: open && !isSmallScreen ? "none" : "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          maxHeight: "100%",
        }}
      >
        <img
          src={PageNotFound}
          style={{
            maxWidth: "500px",
            width: "100%",
            overflow: "auto",
          }}
        />
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          {errorMessage}
        </Typography>
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Redirecting in {timeLeft}...
        </Typography>
      </Box>
    </Box>
  );
}

export default Error;
