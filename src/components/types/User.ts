import { MessageInterface } from "./Message";

export interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface User {
  username: string;
  _id: string;
  img?: string;
  latestMessage?: MessageInterface;
}
