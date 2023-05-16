import express from "express";
import bodyParser from "body-parser";
import UserAuthRoutes from "./routes/userAuthRoutes";
import cors from "cors";


const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
//routes
app.use("/users/auth", UserAuthRoutes);
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("hello motherfucker...");
});

const start = async () => {
  await app.listen(port, () => {
    console.log("starting server....");
  });
};
start();
