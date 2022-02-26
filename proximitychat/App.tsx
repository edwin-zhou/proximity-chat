import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { io } from "socket.io-client";

export default function App() {
  const [mapRegion, setmapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [text, onChangeText] = React.useState("");
  const socket = io("https://proximitychat.glcrx.com");
  function onSend() {
    if (text) {
      socket.emit("chat message", text);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <MapView
        region={mapRegion}
        style={{ alignSelf: 'stretch', height: '100%' }}>
      </MapView>
      <Text>Open up App.tsx to start working on your app!</Text>

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


