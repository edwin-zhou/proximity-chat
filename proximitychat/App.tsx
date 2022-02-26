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
import io from "socket.io-client";
import * as GeoLocation from "expo-location";

const socket = io("https://proximitychat.glcrx.com");

export default function App() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.00605,
    longitudeDelta: 0.000275,
  });
  const [text, setText] = React.useState("");
  const [users, setUsers] = useState<any>([]);

  socket.on("positional message", (message: UserMessage) => {
    console.log(message);
  });

  socket.on("locations", (locations: UserInfo[]) => {
    setUsers(locations);
  });

  useEffect(() => {
    (async () => {
      let { status } = await GeoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
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
              <Marker
                key={0}
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
              ></Marker>
            )}
            {users.map((user: UserInfo, index: number) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                }}
              ></Marker>
            ))}
          </MapView>
          <View style={styles.inputContainer}>
            <Text>{errorMsg}</Text>
            {!errorMsg && location && (
              <Text>
                {location["coords"]["latitude"] +
                  ", " +
                  location["coords"]["longitude"]}
              </Text>
            )}
            {!errorMsg && !location && <Text>waiting...</Text>}
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
