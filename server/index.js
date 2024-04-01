import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'; // // importação do Socket.io

const PORT = 3000;

// Conexão básica do ExpressJS
const app = express();
const server = createServer(app);
const io = new Server(server); // importação do Socket.io

// Entrega a página HTML para o servidor
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'));
});

// É chamado sempre que uma nova conexão é estabelecida
io.on('connection', (socket) => {

    // Obtém o IP de quem conectou
    const ipAddress = socket.handshake.address;
    console.log(`User [${ipAddress} is connected`);

    // Evento enviado pelo client
    socket.on('chat message', (msg) => {

        console.log(`A message received from [${ipAddress}]: ${msg}`);

        // Send back the message to all clients
        const json = JSON.stringify({ message: msg, ip: ipAddress });
        io.emit('from server', json);

    });

    // Notifica quando um usuário desconectou
    socket.on('disconnect', () => {
        console.log(`The user ${ipAddress} was disconnected`);
    });

});

// Inicia o servidor normalamente
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});