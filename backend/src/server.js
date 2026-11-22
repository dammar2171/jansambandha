import 'dotenv/config';
import express from 'express';
import cors from 'cors';

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
import dashboardRoutes from './routes/dashboard.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

import logger from './middlewares/loggerMiddleware.js';
import errorHandler from './middlewares/errorHandler.js';
import config from './config/config.js';
import databaseConnection from './config/db.js';

const app = express();

app.use(cors());
app.use(express.json());
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
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

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
