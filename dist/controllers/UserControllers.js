"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfile = exports.UpdateUserDetails = exports.DeleteUserAccount = exports.LoginUser = exports.CreateUserAccount = void 0;
const PasswordHash_1 = __importStar(require("../helpers/PasswordHash"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//this function takes in a unique identifier and a selector of all the fields you want from the user object
const checkUser = ({ phone, email, id }, select) => __awaiter(void 0, void 0, void 0, function* () {
    if (id) {
        const user = yield prisma.user.findUnique({
            where: {
                id: id,
            },
            select: select,
        });
        if (user) {
            return { userPresent: true, user: user };
        }
        return { userPresent: false, user: null };
    }
    if (phone) {
        const user = yield prisma.user.findUnique({
            where: {
                phone: phone,
            },
            select: select,
        });
        if (user) {
            return { userPresent: true, user: user };
        }
        return { userPresent: false, user: null };
    }
    if (email) {
        const user = yield prisma.user.findUnique({
            where: {
                email: email,
            },
            select: select,
        });
        if (user) {
            return { userPresent: true, user: user };
        }
        return { userPresent: false, user: null };
    }
    return undefined;
});
const CreateUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, phone, password, email } = req.body;
        //check user
        const userExists = yield checkUser({ phone, email });
        if (userExists) {
            res.status(400).json({ message: "user already exists" });
            return;
        }
        //hash password and get hashed pass and salt.
        const { passwordHashed, salt } = yield (0, PasswordHash_1.default)(password);
        console.log(salt, passwordHashed);
        //add to db
        const user = yield prisma.user.create({
            data: {
                first_name: first_name,
                last_name: last_name,
                password: passwordHashed,
                salt: salt,
                phone: phone,
            },
        });
        console.log(user);
        //generate token using user details
        res.status(200).send(user);
    }
    catch (err) {
        res.send(err.message);
    }
});
exports.CreateUserAccount = CreateUserAccount;
const LoginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, email, password } = req.body;
    //check user
    const checkUserResult = yield checkUser({ phone }, {
        first_name: true,
        last_name: true,
        phone: true,
        email: true,
        avatar: true,
        address: true,
        id: true,
        password: true,
    });
    console.log(checkUserResult);
    if (checkUserResult) {
        const { user, userPresent } = checkUserResult;
        if (!userPresent) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        //console.log(user);
        if (phone !== (user === null || user === void 0 ? void 0 : user.phone)) {
            res.status(401).json({ message: "unauthorized" });
            return;
        }
        else {
            const passwordHashed = user.password;
            const passwordMatch = yield (0, PasswordHash_1.DecryptPassword)({ password, passwordHashed });
            if (!passwordMatch) {
                res.status(401).json({ message: "unauthorized" });
            }
            else {
                const { password } = user, cleanUser = __rest(user, ["password"]);
                res.status(200).json({ message: "cleared", user: cleanUser });
            }
        }
    }
});
exports.LoginUser = LoginUser;
const DeleteUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send("delete account");
    }
    catch (err) { }
});
exports.DeleteUserAccount = DeleteUserAccount;
const UpdateUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send("update user details");
    }
    catch (err) { }
});
exports.UpdateUserDetails = UpdateUserDetails;
const GetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const checkUserResult = yield checkUser({ id: id }, {
            first_name: true,
            last_name: true,
            avatar: true,
            address: true,
            email: true,
            gender: true,
            phone: true,
        });
        if (checkUserResult) {
            const { user } = checkUserResult;
            res.status(200).json(user);
        }
    }
    catch (err) { }
});
exports.GetProfile = GetProfile;
