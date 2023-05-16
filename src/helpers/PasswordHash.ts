import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const PasswordHash = async (password: string) => {
    try {
        const saltRounds = 12; // Set the desired number of salt rounds
        const salt = await bcrypt.genSalt(saltRounds);
        console.log("Salt:", salt);

        const passwordHashed = await bcrypt.hash(password, salt);

        return { salt, passwordHashed };
    } catch (err) {
        throw err; // Re-throw the error to propagate it
    }
};

export default PasswordHash;
