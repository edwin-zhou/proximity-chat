import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { UserInfo } from "./Interfaces";

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

  onReceiveLocation(): void {
    socket.on("location", (locations: UserInfo[]) => {});
  },
};

export default SocketService;
