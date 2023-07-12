import { Worker, MessagePort } from 'worker_threads';
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

class WorkerPool {
    wokerpool:Worker[];
    jobs: {jobEmitter: EventEmitter, i: number}[];

    constructor(cores: number) {
        this.wokerpool = [];

        for(let i  = 0; i < cores; i++) {
            const worker = new Worker('./job-worker.ts');

            console.log(`Worker ${i} created`);

            this.wokerpool.push(worker);
        }
        

        this.jobs = [];
    }

    AddJob(i:number) {
        let jobEmitter = new EventEmitter(); 
        let jobPromise =  new Promise((resolve, reject) => {
            jobEmitter.once('message', resolve);
            jobEmitter.once('error', reject)
        });

        let job = {
            jobEmitter,
            i
        }

        this.jobs.push(job);

        eventEmitter.on('pending_job', this._pendingJob);
        
        eventEmitter.emit('pending_job');

        return jobPromise;
    }

    private _pendingJob = () => {
        if(this.jobs.length > 0 && this.wokerpool.length > 0) {
            let availableWorker = this.wokerpool.shift();
            let availableJob = this.jobs.shift();

            if(availableJob && availableWorker) {
                availableWorker.once('message', (result:string) => {
                    console.log(`message received: ${result}`)
    
                    if(availableJob) {
                        availableJob.jobEmitter.emit('message', result)
                    } else {
                        console.log(`Listened for unknown job`)
                    }
                    

                    if(availableWorker) {
                        this.wokerpool.push(availableWorker);

                        eventEmitter.emit('pending_job');
                    } else {
                        console.log(`worker not returned`)
                    }
                });
    
                availableWorker.postMessage(availableJob.i);
            } else {
                if(!availableWorker && availableJob) {
                    this.jobs.unshift(availableJob)

                    console.log(`No worker available yet`);
                }

                if(!availableJob && availableWorker) {
                    this.wokerpool.unshift(availableWorker);

                    console.log(`No jobs`);
                }
            }
            
        }
    }

}

export default WorkerPool;