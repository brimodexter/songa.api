import express, {Express} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import UserAuthRoutes from "./routes/userAuthRoutes";
import CustomerCareAgentRoutes from "./routes/customerCareAgentRoutes";
import RiderAuthRoutes from "./routes/RiderAuthRoutes";


const app: Express = express();

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors());
//routes
app.use("/users/auth", UserAuthRoutes);
app.use("/riders/auth", RiderAuthRoutes);
app.use("/users/customer_agent", CustomerCareAgentRoutes);
app.get("/", (req: express.Request, res: express.Response) => {
    res.send("test route...");
});

export default app;
