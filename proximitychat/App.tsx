import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { Location, User, UserInfo, UserMessage } from "./Interfaces";
import {
  SafeAreaView,
  Image,
  StyleSheet,
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput
} from "react-native";
import { Chip, Modal, Button, Portal, Provider } from "react-native-paper";
import io, { Socket } from "socket.io-client";
import * as GeoLocation from "expo-location";
import emojis from "./Emojis";

export default function App() {
  const [socket, setSocket] = useState<Socket>(io("https://teamchatarea.herokuapp.com/"));
  // io("http://localhost:3000/", {transports: ['websocket']})

  const [visible, setModalVisibility] = React.useState(true);
  const [name, setName] = React.useState("");
  const [notSet, setNotSet] = React.useState(true);
  //modal
  const [location, setLocation] = useState<any>(null);
  const [ownMessage, setOwnMessage] = React.useState("");
  const [text, setText] = React.useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [messages, setMessages] = useState<any>({});
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0024,
    longitudeDelta: 0.00011,
  });
  const containerStyle = { backgroundColor: "white", padding: 20 };
  
  const startMap = async () => {
    setModalVisibility(false);
  };

  useEffect(() => {
    socket.on("locations", (locations: UserInfo[]) => {
      setUsers(locations);
    });

    GeoLocation.requestForegroundPermissionsAsync()
    .then(({status}) => {
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }
      GeoLocation.watchPositionAsync(
        { accuracy: 5, distanceInterval: 2},
        (location) => {
          setLocation(location);
          setMapRegion({
            latitude: Number(location.coords.latitude),
            longitude: Number(location.coords.longitude),
            latitudeDelta: mapRegion.latitudeDelta,
            longitudeDelta: mapRegion.longitudeDelta,
          });
          if (name.trim().length != 0) {
            socket.emit("location", name, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      );
    })

  }, [])

  const toEmoji = (name: String): String => {
    const key = name.split("").reduce((acc, c) => c.charCodeAt(0) * acc, 1) % emojis.length
    return emojis[key]
  }

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      socket.emit("local message", name, text, (response: any) => {
      });
      setOwnMessage(text);
      setText("");
      setTimeout(() => {
        setOwnMessage("");
      }, 15000);
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
      bottom:-5,
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
  let nameText;
  if (notSet) {
    return (
      <Provider>
        <Portal>
          <Modal
            dismissable={false}
            visible={visible}
            onDismiss={startMap}
            contentContainerStyle={containerStyle}
            style={{height:"100%"}}
          >

            <SafeAreaView>
            <TextInput
              value={nameText}
              placeholder="Send a message"
              onChangeText={setName}
              // style={styles.input}
            /></SafeAreaView>
            <Text> </Text>
            <Text> </Text>

            <Button
              mode="contained"
              onPress={() => {
                setNotSet(false);
                startMap();
              }}
            >
              Chat
            </Button>
          </Modal>
        </Portal>
      </Provider>
    );
  } else {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <MapView
              zoomEnabled={false}
              scrollEnabled={false}
              pitchEnabled={false}
              region={mapRegion}
              style={styles.map}
            >
              {location && (
                <View>
                  <Marker
                    style={{ justifyContent: "center", alignItems: "center" }}
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                  >
                    {ownMessage ? (
                      <View
                        style={{
                          backgroundColor: "#fefefe",
                          borderRadius: 12,
                          padding: 5,
                        }}
                      >
                        <Text numberOfLines={5} style={{ maxWidth: 100 }}>
                          {ownMessage}
                        </Text>
                      </View>
                    ) : (
                      <View></View>
                    )}
                    <Text style={{ fontSize: 35 }}>{toEmoji(name)}</Text>
                    <Text style={{ fontSize: 12 }}>{name}</Text>

                  </Marker>
                </View>
              )}
              {users.map((user: UserInfo, index: number) => (
                <View key={index}>
                  <Marker
                    coordinate={{
                      latitude: user.location.latitude,
                      longitude: user.location.longitude,
                    }}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    {messages && messages[user?.id] ? (
                      <View
                        style={{
                          left: -25,
                          backgroundColor: "#fefefe",
                          borderRadius: 12,
                          padding: 5,
                        }}
                      >
                        <Text numberOfLines={5} style={{ maxWidth: 100 }}>
                          {messages[user.id]}
                        </Text>
                        <Text style={{ fontSize: 35 }}>{toEmoji(user.id)}</Text>
                      </View>
                    ) : (
                      <View></View>
                    )}
                  </Marker>
                  <Text style={{ fontSize: 35 }}>{toEmoji(user.id)}</Text>
                </View>
              ))}
            </MapView>
            <View>
              <View style={styles.inputContainer}>
              <SafeAreaView>
                <TextInput
                  value={text}
                  placeholder="Send a message"
                  onChangeText={setText}
                  style={{ width: 300 }}
                  // style={styles.input}
                /></SafeAreaView>
                <View></View>
                <Button
                  disabled={text.trim().length === 0}
                  onPress={handleSendMessage}
                >
                  Go
                </Button>
                <View style={{ width: 10 }}></View>
                <View style={{ width: 10 }}></View>
              </View>
            </View>
            <View style={{ height: Platform.OS === "ios" ? 10 : 0 }}></View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}
