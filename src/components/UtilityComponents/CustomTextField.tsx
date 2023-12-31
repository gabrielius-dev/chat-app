import { TextField, styled } from "@mui/material";

const CustomTextField = styled(TextField)(({ theme }) => ({
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
