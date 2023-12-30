import { Alert, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction, memo } from "react";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const AlertSuccess = memo(function AlertSuccess({
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
    <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default AlertSuccess;
