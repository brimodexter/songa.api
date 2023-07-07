import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

const PasswordHash = async (password: string) => {
  try {
    const saltRounds = 12; // Set the desired number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHashed = await bcrypt.hash(password, salt);

    return { salt, passwordHashed };
  } catch (err) {
    throw err;
  }
};

interface Props {
  password: string;
  passwordHashed: string;
}

export const DecryptPassword = async ({ password, passwordHashed }: Props) => {
  try {
    return bcrypt.compareSync(password, passwordHashed);
  } catch (err) {
    throw err;
  }
};

export default PasswordHash;
