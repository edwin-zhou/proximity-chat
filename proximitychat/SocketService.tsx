import React, {useEffect} from "react";
import { io } from "socket.io-client";

const socket = io("https://proximitychat.glcrx.com")

const SocketService = {

    send(text: string): void {
      if (text) {
        socket.emit("chat message", text);
      }
    },

    onReceiveMessage(): void {
        socket.on("location", (locations: []) => {

        })
    },

    onReceiveLocation(): void {
        socket.on("location", (locations: []) => {

        })
    }


}

export default SocketService