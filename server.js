const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();

const wss = new WebSocket.Server({ host: process.env.HOST, port: process.env.PORT });

let clients = [];

wss.on('connection', (ws) => {

    console.log("Un cliente se ha conectado");
    ws.send(JSON.stringify({ msg: '¡Felicidades, te has conectado exitosamente!' }));
    clients.push({"con": ws, "channelId": 0});
    console.log(clients.length);

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    switch (data.type) {
        case "connection":
            let cli = clients.findIndex(x => x.con === ws);
            if(cli > -1){
                clients[cli].channelId = parseInt(data.channelId);
                console.log("Se añadió la conexión del canal "+data.channelId);
            }
            break;
        case "message":
            let rec = clients.findIndex(x => x.channelId === parseInt(data.channelId));
            if(rec > -1) {
                const client = clients[rec].con;
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ sender: data.message.sender, senderName: data.message.senderName, platform: data.message.platform, type: data.message.type, msg: data.message.msg, file: data.message.file, fileName: data.message.fileName, time: data.message.time }));
                    console.log("Se enviado el mensaje al canal "+data.channelId);
                }
            }
        break;
        case "store":
            let cli_store = clients.findIndex(x => x.channelId === parseInt(data.channelId));
            if(cli_store > -1) {
                const client = clients[cli_store].con;
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "store" }));
                    console.log("Se enviado el mensaje al canal "+data.channelId);
                }
            }
          break;
          
        case "booking":
          let cli_booking = clients.findIndex(x => x.channelId === parseInt(data.channelId));
          if(cli_booking > -1) {
              const client = clients[cli_booking].con;
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: "booking" }));
                  console.log("Se enviado el mensaje al canal "+data.channelId);
              }
          }
        break;
    }

  });

  ws.on('close', () => {
    let cli = clients.findIndex(x => x.con === ws);
    if (cli > -1) {
    clients.splice(cli, 1);
    }
  });

  ws.on('error', (error) => {
    console.error(`Error en WebSocket: ${error}`);
  });
});

console.log(`Servidor WebSocket corriendo en ws://${process.env.HOST}:${process.env.PORT}`);
