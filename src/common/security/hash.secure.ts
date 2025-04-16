import * as bcrypt from 'bcrypt';

export const generateHash = (
  plainText: string = '',
  salt: number = parseInt(process.env.SALT_ROUND as string),
): string => {
  const Hash = bcrypt.hashSync(plainText, salt);
  return Hash;
};

export const compareHash = (
  plainText: string = '',
  hashValue: string = '',
): boolean => {
  const match = bcrypt.compareSync(plainText, hashValue);
  console.log(match);

  return match;
};
