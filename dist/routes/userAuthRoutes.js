"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const router = express_1.default.Router();
router.post("/create-user-account", UserControllers_1.CreateUserAccount);
router.post("/login-user", UserControllers_1.LoginUser);
router.post("/delete-user/:id", UserControllers_1.DeleteUserAccount);
router.post("/delete-user/:id", UserControllers_1.UpdateUserDetails);
router.get("/profile/:id", UserControllers_1.GetProfile);
exports.default = router;
