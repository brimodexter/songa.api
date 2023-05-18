import express, {Express} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import UserAuthRoutes from "./routes/userAuthRoutes";
import CustomerCareAgentRoutes from "./routes/customerCareAgentRoutes";


const app: Express = express();
const port: number = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
//routes
app.use("/users/auth", UserAuthRoutes);
app.use("/users/customer_agent", CustomerCareAgentRoutes);
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("hello motherfucker...");
});

const start = async (): Promise<void> => {
  await app.listen(port, () => {
    console.log("starting server....");
    console.log("Server started at", port);
  });
};
start();
