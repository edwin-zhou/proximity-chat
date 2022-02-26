const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(
    `User with id ${socket.id} connected at ${new Date().toLocaleString()}`
  );

  socket.on("disconnect", () => {
    console.log(
      `User with id ${socket.id} disconnected at ${new Date().toLocaleString()}`
    );
  });

  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
    io.emit("chat message", msg);
  });

  socket.on("positional message", async (msg) => {
    const allSockets = await io.fetchSockets();
    const receivers = allSockets
      .map((s) => s.id)
      .filter((id) => id < socket.id);
    if (receivers.length > 0) {
      io.to(receivers).emit("positional message", msg);
      console.log(
        `${
          socket.id
        } sent the following message to ${receivers} at ${new Date().toLocaleString()}: \n"${msg}"`
      );
    } else {
      console.log(
        `${socket.id} sent the following message but no one will receive it: \n"${msg}"`
      );
    }
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
