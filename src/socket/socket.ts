import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACK_END_URL}`, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
