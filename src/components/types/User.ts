import { MessageInterface } from "./Message";

export interface UserResponse {
  success: boolean;
  message: string;
  user: UserInterface;
}

export interface UserInterface {
  username: string;
  password: string;
  _id: string;
  img?: string;
}

export interface User {
  username: string;
  _id: string;
  img?: string;
  latestMessage?: MessageInterface;
}
