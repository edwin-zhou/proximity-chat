const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const getDistanceInDegrees = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2);
};

const getDistanceInKmApprox = (lat1, lon1, lat2, lon2) => {
  return getDistanceInDegrees(lat1, lon1, lat2, lon2) * 111;
};

io.on("connection", (socket) => {
  console.log(
    `${new Date().toLocaleString()}: User with id ${socket.id} connected`
  );

  socket.on("disconnect", () => {
    console.log(
      `${new Date().toLocaleString()}: User with id ${socket.id} disconnected`
    );
  });

  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
    io.emit("chat message", msg);
  });

  socket.on("positional message", async (msg) => {
    const allSockets = await io.fetchSockets();
    const receivers = allSockets
      .filter((s) => {
        const d = getDistanceInKmApprox(
          socket.data.latitude,
          socket.data.longitude,
          s.data.latitude,
          s.data.longitude
        );
        console.log(d);
        return d < 10;
      })
      .map((s) => s.id);
    if (receivers.length > 0) {
      io.to(receivers).emit("positional message", msg);
      console.log(
        `${new Date().toLocaleString()}: ${
          socket.id
        } sent the following message to [ ${receivers} ]: \n"${msg}"`
      );
    } else {
      console.log(
        `${new Date().toLocaleString()}: ${
          socket.id
        } sent the following message but no one will receive it: \n"${msg}"`
      );
    }
  });

  socket.on("position", (latitude, longitude) => {
    socket.data.latitude = latitude;
    socket.data.longitude = longitude;
    console.log(
      `User with id ${socket.id} reported position: ${latitude}, ${longitude}`
    );
  });

  const positionReportInterval = setInterval(async () => {
    const allSockets = await io.fetchSockets();
    const nearbyUsers = allSockets.filter((s) => {
      const d = getDistanceInKmApprox(
        socket.data.latitude,
        socket.data.longitude,
        s.data.latitude,
        s.data.longitude
      );
      return d < 10 && s.id !== socket.id;
    });
    if (nearbyUsers.length > 0) {
      io.to(socket.id).emit(
        "positions",
        nearbyUsers.map((s) => {
          return {
            id: s.id,
            latitude: s.data.latitude,
            longitude: s.data.longitude,
          };
        })
      );
    }
  }, 10000);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
