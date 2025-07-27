import express, { Request, Response, NextFunction } from 'express';

import './config/dotenv.config'; // Load environment variables


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello from rewss-api!');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;