import React, { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://proximitychat.glcrx.com");

const SocketService = {
  sendMessage(text: string): void {
    if (text) {
      socket.emit("positional message", text);
    }
  },

  sendPosition(latitude: number, longitude: number): void {
    socket.emit("position", latitude, longitude);
  },

  onReceiveMessage(): void {
    socket.on("location", (locations: []) => {});
  },

  onReceiveLocation(): void {
    socket.on("location", (locations: []) => {});
  },
};

export default SocketService;
