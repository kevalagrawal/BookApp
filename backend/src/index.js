import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from "./lib/db.js";
import {job} from "./lib/cron.js"

const app = express();
dotenv.config();
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 3000
job.start();

app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)

app.listen(PORT,()=>{
    console.log(`Server listening on the port ${PORT}`);
    connectDB();
})