import { Dispatch, SetStateAction, useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import Messaging from "./Messaging";

type setOpenType = Dispatch<SetStateAction<boolean>>;
type setMessagingUserExistsType = Dispatch<SetStateAction<boolean>>;

const MessagingWrapper = memo(function MessagingWrapper({
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
});

export default MessagingWrapper;
