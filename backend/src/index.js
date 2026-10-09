import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js"
import { startTranscodeWorker } from "./workers/transcode.worker.js"
import { cronService } from "./services/cron.service.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    // Start background transcode worker
    startTranscodeWorker();

    // Start analytics cron jobs
    cronService.start();

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT}`);
    });
})
.catch((error) => {
    console.log("MONGO DB connection Failed !!", error);
});
