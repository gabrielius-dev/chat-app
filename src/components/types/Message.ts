export interface MessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: string;
  receiver: string;
}

interface SenderInterface {
  _id: string;
  img?: string;
  username: string;
}

export interface GroupMessageInterface {
  _id: string;
  content: string;
  createdAt: string;
  sender: SenderInterface;
  receiver: string;
}
