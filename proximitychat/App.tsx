import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { io } from "socket.io-client";

export default function App() {
  const [text, onChangeText] = React.useState("");
  const socket = io("https://proximitychat.glcrx.com");
  function onSend() {
    if (text) {
      socket.emit("chat message", text);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Send a message"
      />
      <Button
        title="Send"
        onPress={onSend}
        disabled={text.trim().length === 0}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
