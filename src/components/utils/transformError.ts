import { ErrorInterface } from "../types/Error";

interface ErrorObject {
  password?: string[];
  username?: string[];
  passwordConfirmation?: string[];
  name?: string[];
  users?: string[];
  image?: string[];
}

export function transformError(errorArray: ErrorInterface[]): ErrorObject {
  type FormattedData = Record<string, string[]>;
  const formattedData: FormattedData = {};
  errorArray.forEach((item) => {
    if (formattedData[item.path]) {
      formattedData[item.path].push(item.message);
    } else {
      formattedData[item.path] = [item.message];
    }
  });
  return formattedData;
}
