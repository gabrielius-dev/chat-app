import { Alert, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction, memo } from "react";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const AlertError = memo(function AlertError({
  message,
  open,
  setOpen,
}: {
  message: string;
  open: boolean;
  setOpen: setOpenType;
}) {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Snackbar open={open} autoHideDuration={7000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default AlertError;
