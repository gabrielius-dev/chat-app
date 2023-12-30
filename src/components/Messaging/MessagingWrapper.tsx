import { Dispatch, SetStateAction, useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import Messaging from "./Messaging";

type setOpenType = Dispatch<SetStateAction<boolean>>;

const MessagingWrapper = memo(function MessagingWrapper({
  isSocketConnected,
  open,
  setOpen,
}: {
  isSocketConnected: boolean;
  open: boolean;
  setOpen: setOpenType;
}) {
  const { selectedUserId } = useParams();
  const [key, setKey] = useState(selectedUserId);

  useEffect(() => {
    setKey(selectedUserId);
  }, [selectedUserId]);

  return (
    <Messaging
      key={key}
      isSocketConnected={isSocketConnected}
      open={open}
      setOpen={setOpen}
    />
  );
});

export default MessagingWrapper;
