const { WebSocketServer } = require("ws");
const { setupConfig } = require("../../config");
let wss = new WebSocketServer({
  port: setupConfig.localWebsocketPort,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
  },
});
wss.on("connection", function connection(ws) {
  console.log("Frontend socket connected!");
});
wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(function each(client) {
    client.send(msg);
    console.log("Broadcast close-profile event success!");
  });
};

module.exports = {
  wss,
};
