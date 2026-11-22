import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sanitize from './middlewares/sanitize.js';

// import routes here
import authRoutes from './routes/auth.routes.js';
import projectProposalRoutes from './routes/projectProposalRoutes.js';
import userRoutes from './routes/user.routes.js';
import wardRoutes from './routes/ward.routes.js';
import departmentRoutes from './routes/department.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import progressUpdateRoutes from './routes/progressUpdate.routes.js';
import contractorRoutes from './routes/contractor.routes.js';

import logger from './middlewares/loggerMiddleware.js';
import errorHandler from './middlewares/errorHandler.js';
import config from './config/config.js';
import databaseConnection from './config/db.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { AppError } from './utils/AppError.js';

const app = express();

const corsOptions = config.corsOrigins.length
  ? {
      origin: (origin, callback) => {
        if (
          !origin ||
          config.corsOrigins.includes('*') ||
          config.corsOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
        return callback(new AppError('Not allowed by CORS', 403));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }
  : {};

app.set('trust proxy', config.trustProxy ? 1 : false);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);
app.use(globalLimiter);
app.use(logger);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/project-proposals', projectProposalRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wards', wardRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/progress-updates', progressUpdateRoutes);
app.use('/api/v1/contractors', contractorRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const startServer = async () => {
  await databaseConnection();
  app.listen(config.port, () => {
    console.log(
      `Server running on http://${config.host || 'localhost'}:${config.port}`,
    );
  });
};

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default app;
