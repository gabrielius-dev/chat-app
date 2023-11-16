import { Box, useTheme } from "@mui/material";
import { ClipLoader } from "react-spinners";

function LoadingScreen() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <ClipLoader size={"20vw"} color={theme.deepBlue} />
    </Box>
  );
}

export default LoadingScreen;
