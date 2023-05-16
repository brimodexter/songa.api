import express from "express";

import {CustomerCareAgent} from '../controllers/customer_care.controller';

const router=express.Router();
// exports.routesConfig = (app:Express) => {
//     app.post('/users/customer-care-agent', [
//         AuthorizationController.insert
//     ]);
// }

router.post("/create-user-account", CustomerCareAgent)


export default router;