import { TextField, styled } from "@mui/material";

const CustomTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& label.Mui-focused": {
    color: theme.deepBlue,
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: theme.deepBlue,
  },
  "& .MuiInputLabel-root": {
    color: theme.deepBlue,
  },
  "&:hover .MuiInputLabel-root": {
    color: theme.deepBlue,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "40px",
    "& fieldset": {
      borderColor: theme.deepBlue,
    },
    "&:hover fieldset": {
      borderColor: theme.deepBlue,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.deepBlue,
    },
  },
}));

export default CustomTextField;
