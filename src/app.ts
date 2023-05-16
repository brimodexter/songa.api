const express = require('express')
const bodyParser = require('body-parser')
import {Request, Response} from 'express'
import cors from "cors";
import CustomerCareAgentRoutes from "./routes/customerCareAgentRoutes";

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use(cors());
//routes
app.use("/users/customer_agent", CustomerCareAgentRoutes);
app.get('/', (request: Request, response: Response) => {
    response.json({info: 'Node.js, Express, and Postgres API'})
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})