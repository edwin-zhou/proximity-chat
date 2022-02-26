import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { Location as Location, User, UserInfo, UserMessage } from "./Interfaces";

const socket = io("https://proximitychat.glcrx.com");

const SocketService = {
  sendMessage(message: string): void {
    socket.emit("local message", message);
  },

  sendLocation(location: Location) {
    socket.emit("location", location);
  },

  receiveMessage(): void {
    socket.on("positional message", (message: UserMessage) => {
      console.log(message);
    });
  },

  receiveLocations(): void {
    socket.on("locations", (locations: UserInfo[]) => {
      console.log(locations)
    });
  },
};

export default SocketService;
