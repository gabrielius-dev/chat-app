import { Box, useTheme } from "@mui/material";
import { ClipLoader } from "react-spinners";

function LoadingScreen() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ClipLoader
        color={theme.deepBlue}
        cssOverride={{
          aspectRatio: "1/1",
          width: "40%",
          height: "auto",
          maxWidth: "300px",
        }}
      />
    </Box>
  );
}

export default LoadingScreen;
