import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import WorkerPool from './worker-pool';

class Server {
    public app = express();
}

const server = new Server();

const router = express.Router();
const workerPool = new WorkerPool(10);

router.post('/', async (req: Request, res: Response) => {
    let tasks = req.body.tasks as number;
    let jobs:Promise<any>[] = [];

    for(let i = 0; i < tasks; i++) {
        console.log(`creating job ${i}`)
        jobs.push(workerPool.AddJob(i));
    }

    let results = await Promise.all(jobs);

    res.status(200).json({
        results
    })
});

server.app.use(bodyParser.json())
server.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.app.use('', router);

((port = process.env.APP_PORT || 5000) => {
    server.app.listen(port, () => console.log(`Listening on port ${port}`));
})();