import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";

const PasswordHash = async (password: string) => {

    try {
        const saltRounds = 12; // Set the desired number of salt rounds
        const salt = await bcrypt.genSalt(saltRounds);
        console.log("Salt:", salt);

        const passwordHashed = await bcrypt.hash(password, salt);

        return {salt, passwordHashed};
    } catch (err) {
        throw err;
    }
};

interface Props {
    password: string;
    passwordHashed: string;
}

export const DecryptPassword = async ({password, passwordHashed}: Props) => {
    try {
        const passwordMatch = bcrypt.compareSync(password, passwordHashed);
        return passwordMatch;
    } catch (err) {
        throw err;
    }
};

export default PasswordHash;
