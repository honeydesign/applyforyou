import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes         from './routes/auth.routes';
import userRoutes         from './routes/user.routes';
import cvRoutes           from './routes/cv.routes';
import preferencesRoutes  from './routes/preferences.routes';
import applicationsRoutes from './routes/applications.routes';
import { errorHandler }   from './middleware/error.middleware';
import { startCronJobs }  from './services/cron.service';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         authRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/cv',           cvRoutes);
app.use('/api/preferences',  preferencesRoutes);
app.use('/api/applications', applicationsRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Apply-4You API', timestamp: new Date() }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Apply-4You API running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'test') startCronJobs();
});

export default app;