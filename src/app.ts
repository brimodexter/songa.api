import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import UserAuthRoutes from './Users/routes/userAuthRoutes';
import CustomerCareAgentRoutes from './CCA/customerCareAgentAuthRoutes';
import RiderAuthRoutes from './Riders/routes/RiderAuthRoutes';
import mpesaRoutes from './Payments/mpesaRoutes';
import swaggerDocument from './swagger.json';
import UserOTPRoutes from './routes/userOTPRoutes';
import RiderRoutes from './Ride/Routes';
import RiderProfileRoutes from './Riders/routes/RiderProfileRoutes';

const app: Express = express();
var options = {
  explorer: true,
};
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
//routes
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);
app.use('/api/users/auth', UserAuthRoutes);
app.use('/api/riders/auth', RiderAuthRoutes);
app.use('/api/riders/profile', RiderProfileRoutes);
app.use('/api/points', mpesaRoutes);
app.use('/api/users/auth/OTP', UserOTPRoutes);
app.use('/api/customer_agent', CustomerCareAgentRoutes);
app.use('/api/rides', RiderRoutes);
app.get('/api/', (req: Request, res: Response) => {
  res.send('test route...');
});

export default app;
