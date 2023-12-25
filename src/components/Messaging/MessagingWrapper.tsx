import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Messaging from "./Messaging";

type setOpenType = (open: boolean) => void;
type setMessagingUserExistsType = (open: boolean) => void;

function MessagingWrapper({
  isSocketConnected,
  open,
  setOpen,
  setMessagingUserExists,
}: {
  isSocketConnected: boolean;
  open: boolean;
  setOpen: setOpenType;
  setMessagingUserExists: setMessagingUserExistsType;
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
      setMessagingUserExists={setMessagingUserExists}
    />
  );
}

export default MessagingWrapper;
