const http = require("http");

const app = require("./app");
const { setupChatSocket } = require("./socket");

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

setupChatSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
