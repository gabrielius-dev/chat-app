import { Alert, AlertColor, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction, memo } from "react";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const AlertNotification = memo(function AlertNotification({
  message,
  type,
  open,
  setOpen,
}: {
  message: string;
  type: AlertColor;
  open: boolean;
  setOpen: setOpenType;
}) {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Snackbar open={open} autoHideDuration={7000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={type} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default AlertNotification;
