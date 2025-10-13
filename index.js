import { createHttpServer } from "./src/server/httpServer.js";
import { initSocket } from "./src/socket/socket.js";
import { configDotenv } from "dotenv";
configDotenv();

const {app, server} = createHttpServer();
initSocket(server);

console.log(`iniciando servidor: http://localhost:${process.env.PORT}/`)
server.listen(process.env.PORT);