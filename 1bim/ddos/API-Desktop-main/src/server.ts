import express, { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/routes';
import { requestCounterMiddleware } from './middlewares/middleware';
import logger from './middlewares/auditLogger';


dotenv.config();

const server = express();

server.use(cors());

server.use(express.static(path.join(__dirname, '../public')));

//AQUI EU DIGO O FORMATO QUE EU QUERO A REQUISIÇÃO
//server.use(express.urlencoded({ extended: true })); // USANDO URL ENCODED
server.use(express.json()); //USANDO JSON

server.use(requestCounterMiddleware);

server.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Request: ${req.method} ${req.url}`);
    next();
  });

server.get('/ping', (req: Request, res: Response) => res.json({ pong: true }));

server.use(apiRoutes);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: 'Endpoint não encontrado.' });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(400); // Bad Request
    console.log(err);
    res.json({ error: 'Ocorreu algum erro.' });
}
server.use(errorHandler);

server.listen(process.env.PORT);