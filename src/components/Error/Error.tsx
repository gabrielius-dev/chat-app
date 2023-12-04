import { Box, Typography } from "@mui/material";
import PageNotFound from "../../assets/illustrations/page-not-found.svg";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Error({ errorMessage }: { errorMessage: string }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();
  const navigate = useNavigate();

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
        display: "flex",
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
          mt: "-60px",
        }}
      >
        <img
          src={PageNotFound}
          style={{
            width: "90vw",
            maxWidth: "500px",
          }}
        />
        <Typography variant="h4">{errorMessage}</Typography>
        <Typography variant="h6">Redirecting in {timeLeft}...</Typography>
      </Box>
    </Box>
  );
}

export default Error;
