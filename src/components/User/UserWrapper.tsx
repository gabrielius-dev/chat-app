import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import User from "./User";

type setOpenType = Dispatch<SetStateAction<boolean>>;

function UserWrapper({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: setOpenType;
}) {
  const { id } = useParams();
  const [key, setKey] = useState(id);

  useEffect(() => {
    setKey(id);
  }, [id]);

  return <User open={open} setOpen={setOpen} key={key} />;
}

export default UserWrapper;
