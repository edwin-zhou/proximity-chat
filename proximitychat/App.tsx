import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
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
import SocketService from "./SocketService";
import * as Location from "expo-location";

export default function App() {
  useEffect(() => {
    SocketService.receiveLocations();
    SocketService.receiveMessage();
  });

  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [users, setUsers] = useState<any>([]);

  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.00605,
    longitudeDelta: 0.000275,
  });

  const [text, setText] = React.useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      Location.watchPositionAsync(
        { accuracy: 6, distanceInterval: 1 },
        (location) => {
          setLocation(location);
          setMapRegion({
            latitude: Number(location.coords.latitude),
            longitude: Number(location.coords.longitude),
            latitudeDelta: mapRegion.latitudeDelta,
            longitudeDelta: mapRegion.longitudeDelta,
          });
          SocketService.sendLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      );
    })();
  }, []);

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      SocketService.sendMessage(text);
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
            {/* {location ? <Marker key={0} coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}> </Marker> : null} */}
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
