import { v4 as uuid } from "uuid";

export const genId = (): string => {
  return uuid();
};
