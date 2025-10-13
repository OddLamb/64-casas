import { createServer } from "http";
import express from "express";

export const createHttpServer = () =>{
    const app = express();
    app.use(express.static("public"));

    const server = createServer(app);
    return { app, server };
}