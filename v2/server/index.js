import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'; // // importação do Socket.io

import {EVENTS} from '../../events.js';

const PORT = 3000;

// Conexão básica do ExpressJS
const app = express();
const server = createServer(app);
const io = new Server(server); // importação do Socket.io

// Entrega a página HTML para o servidor
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '../client'))); // Diretório estático com o css
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'));
});

let connectedUsers = [];

// É chamado sempre que uma nova conexão é estabelecida
io.on( 'connection' , (socket) => {

    // Obtém o informações de quem conectou
    const ipAddress = socket.handshake.address;
    const conID = socket.id;
    connectedUsers.push({id: conID, name: null});

    // Adiciona o usuário em uma sala
    //socket.join("room1")

    // Envia um evento informando o ID atribuído
    socket.emit(EVENTS.NEW_CONNECTION, conID);
    socket.on(EVENTS.NEW_CONNECTION, (id, username) => {
        connectedUsers = connectedUsers.map( user => user.id == id ? {...user, name: username} : user );
        io.emit(EVENTS.USER_NOTIFICATION, JSON.stringify(connectedUsers));
    });
   
    // Evento enviado pelo client
    socket.on(EVENTS.NEW_CLIENT_MESSAGE, (msg) => {

        console.log(`A message received from [${conID}]: ${msg}`);

        const json = {
            username: conID,
            message: msg
        }

        // Send back the message to all clients
        io.emit(EVENTS.BROADCAST_MESSAGE, JSON.stringify(json));

    });

    // Notifica quando um usuário desconectou
    socket.on( 'disconnect' , () => {
        console.log(`The user ${conID} was disconnected`);
        connectedUsers = connectedUsers.filter(user => user.id != conID);
        io.emit(EVENTS.USER_NOTIFICATION, JSON.stringify(connectedUsers));
    });

});

// Inicia o servidor normalamente
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});