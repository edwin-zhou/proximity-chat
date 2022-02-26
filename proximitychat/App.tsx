import React, { useEffect } from "react";
import { useState } from "react";
import MapView from "react-native-maps";
import {
  Button,
  StyleSheet,
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import SocketService from "./SocketService";

export default function App() {
  useEffect(() => {
    SocketService.onReceiveLocation();
    SocketService.onReceiveMessage();
  });

  const [mapRegion, setmapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [text, setText] = React.useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "flex-start",
    },
    map: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
    },
    inputContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    input: {
      flex: 1,
      height: 40,
      paddingHorizontal: 12,
      margin: 10,
      borderColor: "#777777",
      borderWidth: 1,
      borderRadius: 20,
    },
    sendButton: {},
  });

  function handleSendMessage() {
    if (text.trim().length > 0) {
      SocketService.send(text);
      setText("");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <MapView region={mapRegion} style={styles.map}></MapView>
          <View style={styles.inputContainer}>
            <TextInput
              value={text}
              placeholder="Send a message"
              onChangeText={setText}
              style={styles.input}
            />
            <Button
              title="Send"
              disabled={text.trim().length === 0}
              onPress={handleSendMessage}
            ></Button>
            <View style={{ width: 10 }}></View>
          </View>
          <View style={{ height: Platform.OS === "ios" ? 10 : 0 }}></View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
