import { nanoid } from 'nanoid';

export const generateRandomString = (length: number = 10): string => {
  return nanoid(length);
};
