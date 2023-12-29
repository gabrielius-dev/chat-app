import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GroupChat from "./GroupChat";

type setOpenType = Dispatch<SetStateAction<boolean>>;
type setGroupChatExistsType = Dispatch<SetStateAction<boolean>>;

function GroupChatWrapper({
  isSocketConnected,
  open,
  setOpen,
  setGroupChatExists,
}: {
  isSocketConnected: boolean;
  open: boolean;
  setOpen: setOpenType;
  setGroupChatExists: setGroupChatExistsType;
}) {
  const { chatId } = useParams();
  const [key, setKey] = useState(chatId);

  useEffect(() => {
    setKey(chatId);
  }, [chatId]);

  return (
    <GroupChat
      key={key}
      isSocketConnected={isSocketConnected}
      open={open}
      setOpen={setOpen}
      setGroupChatExists={setGroupChatExists}
    />
  );
}

export default GroupChatWrapper;
