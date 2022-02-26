import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { Location, User, UserInfo, UserMessage } from "./Interfaces";
import {
  Button,
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Chip } from "react-native-paper";
import io from "socket.io-client";
import * as GeoLocation from "expo-location";

const socket = io("https://proximitychat.glcrx.com");

export default function App() {
  const [location, setLocation] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0024,
    longitudeDelta: 0.00011,
  });
  const [text, setText] = React.useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [messages, setMessages] = useState<Map<string, string>>(new Map());

  socket.on("local message", (message: UserMessage) => {
    let nextMessages = messages;
    nextMessages.set(message.id, message.message);
    setMessages(nextMessages);
    setTimeout(() => {
      let nextMessages = messages;
      if (nextMessages.get(message.id) === message.message) {
        nextMessages.delete(message.id);
        setMessages(nextMessages);
      }
    }, 15000);
  });

  socket.on("locations", (locations: UserInfo[]) => {
    setUsers(locations);
  });

  useEffect(() => {
    (async () => {
      let { status } = await GeoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }
      GeoLocation.watchPositionAsync(
        { accuracy: 6, distanceInterval: 1 },
        (location) => {
          setLocation(location);
          setMapRegion({
            latitude: Number(location.coords.latitude),
            longitude: Number(location.coords.longitude),
            latitudeDelta: mapRegion.latitudeDelta,
            longitudeDelta: mapRegion.longitudeDelta,
          });
          socket.emit("location", {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();
  }, []);

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      socket.emit("local message", text);
      setText("");
    }
  };

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <MapView
            zoomEnabled={false}
            pitchEnabled={false}
            scrollEnabled={false}
            region={mapRegion}
            style={styles.map}
          >
            {location && (
              <View>
                <Marker
                  pinColor={"blue"}
                  key={0}
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                ></Marker>
              </View>
            )}
            {users.map((user: UserInfo, index: number) => (
              <Marker
                pinColor={"red"}
                key={index}
                coordinate={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                }}
              ></Marker>
            ))}
          </MapView>
          <View>
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
          </View>
          <View style={{ height: Platform.OS === "ios" ? 10 : 0 }}></View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
