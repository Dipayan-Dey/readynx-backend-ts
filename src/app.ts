import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import v1Router from "./api/v1";
// import githubrouter from "./api/v1/routes/integrations.routes";
// import connectDB from "./config/db";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "https://readynx.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());


app.get("/", (_, res) => {
    res.send("API is running...");
});

app.use("/api/v1",v1Router)
// connectDB();
export default app;
