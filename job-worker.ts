import { isMainThread, parentPort } from 'node:worker_threads'

parentPort?.on('message', (i:number) => {
    let randomTime = 2000
    console.log(`Processing job ${i} in ${randomTime} ms in main thread: ${isMainThread}`)

    setTimeout(() => {
        parentPort?.postMessage(`processed ${i}`);
    }, randomTime)
});
