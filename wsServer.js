// const http = require('http');
// const WebSocket = require('ws');
// const { getNewestNews } = require('./models/newsModel'); // Adjust the path as necessary
// const sqlConnect = require('./databaseConfig/db'); // Import your database connection

// const server = http.createServer();

// // Create WebSocket server
// const wsServer = new WebSocket.Server({ server });

// // Function to fetch and broadcast the newest news to all connected clients
// async function broadcastNewestNews() {
//     try {
//         const pool = await sqlConnect();
//         const newestNews = await getNewestNews(pool);
        
//         const message = JSON.stringify({ type: 'NEWEST_NEWS', data: newestNews });

//         wsServer.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(message);
//             }
//         });

//         console.log('Newest News broadcasted successfully');
//     } catch (error) {
//         console.error('Error broadcasting newest news:', error);
//     }
// }

// // Schedule to broadcast the newest news every minute
// setInterval(broadcastNewestNews, 60000);

// // WebSocket server connection handling
// wsServer.on('connection', (ws) => {
//     console.log('Client connected');

//     // Handle disconnection
//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });

//     // Optionally, send the newest news immediately upon connection
//     broadcastNewestNews().catch(error => console.error('Error sending newest news on connection:', error));
// });

// module.exports = server;


const WebSocket = require('ws');
const sqlConnect = require('./databaseConfig/db');
const { getNewestNews } = require('./models/newsModel'); // Adjust the path as necessary

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send('Welcome to the chat, enjoy :)');

    ws.on('message', (message) => {
      console.log('Received message:', message);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  async function broadcastNewestNews() {
    try {
      const pool = await sqlConnect();
      const newestNews = await getNewestNews(pool);

      console.log('Newest News:', newestNews);

      const message = JSON.stringify({ type: 'NEWEST_NEWS', data: newestNews });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting newest news:', error);
    }
  }

  setInterval(broadcastNewestNews, 600000);
};
