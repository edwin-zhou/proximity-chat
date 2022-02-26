const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(`User with id ${socket.id} connected at ${new Date()}`);

  socket.on("disconnect", () => {
    console.log(`User with id ${socket.id} disconnected at ${new Date()}`);
  });

  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
    io.emit("chat message", msg);
  });

  socket.on("positional message", async (msg) => {
    const allSockets = await io.fetchSockets();
    const receivers = allSockets
      .filter((s) => s.id < socket.id);
    console.log()
    const receiversReduced
      .reduce((acc, s) => acc.to(`socket#${s.id}`), io);
    receivers.emit("positional message", msg);
    console.log
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
