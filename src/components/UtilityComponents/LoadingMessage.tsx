import { Box, Typography } from "@mui/material";
import { ClockLoader } from "react-spinners";
import formatCustomDate from "../utils/formatDate";

function LoadingMessage({ createdAt }: { createdAt: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "70%",
        mb: 2,
        ml: "auto",
      }}
    >
      <Box
        sx={{
          ml: "auto",
          position: "relative",
          backgroundColor: "#1C768F",
          padding: "10px",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          p: 2,
        }}
      >
        <Typography variant="subtitle1" color="white">
          Message is being sent
        </Typography>
        <ClockLoader size={15} color="white" />
      </Box>
      <Typography
        sx={{
          color: "rgba(0, 0, 0, 0.6)",
          ml: "auto",
        }}
      >
        {formatCustomDate(createdAt)}
      </Typography>
    </Box>
  );
}

export default LoadingMessage;
