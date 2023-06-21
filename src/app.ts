import express, {Express, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import UserAuthRoutes from "./routes/userAuthRoutes";
import CustomerCareAgentRoutes from "./routes/customerCareAgentAuthRoutes";
import RiderAuthRoutes from "./routes/RiderAuthRoutes";
import mpesaRoutes from "./routes/mpesaRoutes";
import swaggerDocument from './swagger.json'
import UserOTPRoutes from './routes/userOTPRoutes'

const app: Express = express();
var options = {
    explorer: true
  };
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
//routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
app.use("/api/users/auth", UserAuthRoutes);
app.use("/api/riders/auth", RiderAuthRoutes);
app.use("/api/points", mpesaRoutes);
app.use("/api/users/auth/OTP", UserOTPRoutes);
app.use("/api/customer_agent", CustomerCareAgentRoutes);
app.get("/api/", (req: Request, res: Response) => {
    res.send("test route...");
});

export default app;
