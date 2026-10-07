import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js"
import { startTranscodeWorker } from "./workers/transcode.worker.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    // Start background transcode worker
    startTranscodeWorker();

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT}`);
    });
})
.catch((error) => {
    console.log("MONGO DB connection Failed !!", error);
});
