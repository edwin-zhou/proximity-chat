import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { Location, User, UserInfo, UserMessage } from "./Interfaces";
import {
  Image,
  Button,
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Modal, 
} from "react-native";
import { Chip } from "react-native-paper";
import io from "socket.io-client";
import * as GeoLocation from "expo-location";


export default function App() {
  //modal
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};

  const socket = io("https://proximitychat.glcrx.com");
  const [location, setLocation] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0024,
    longitudeDelta: 0.00011,
  });
  const [ownMessage, setOwnMessage] = React.useState("")
  const [text, setText] = React.useState("");
  const [emojiMapping, setEmojiMapping] = React.useState(new Map())
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [messages, setMessages] = useState<any>({});
  const name = "Test Name";

  useEffect(() => {
    socket.once("local message", (message: UserMessage) => {
      let nextMessages = {...messages};
      // console.log(JSON.stringify(nextMessages));
      nextMessages[message.id] =  message.message;
      // console.log(nextMessages)
      setMessages(nextMessages);
      // console.log(JSON.stringify(messages));
      setTimeout(() => {
        let nextMessages = {...messages};
        if (nextMessages[message.id] === message.message) {
          delete nextMessages[message.id];
          setMessages(nextMessages);
        }
      }, 15000);
    });
  })

  socket.on("locations", (locations: UserInfo[]) => {
    locations.forEach((userInfo) => {
      
    })
    setUsers(locations);
  });

  const toEmoji = (name: String): String => {
    name.charCodeAt(0) 
    return ""
  }

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
          socket.emit("location", name, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();
  }, []);

  const handleSendMessage = () => {
    if (text.trim().length > 0) {
      socket.emit("local message", name, text);
      setOwnMessage(text)
      setText("");
      setTimeout(() => {
        setOwnMessage("")
      }, 15000)
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
                      style={{justifyContent: "center", alignItems: "center"}}
                      coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}>
                    { ownMessage ?
                    <View style={{backgroundColor: "#fefefe", borderRadius:12, padding: 5}}>
                      <Text numberOfLines={5} style={{maxWidth:100}}>{ownMessage}</Text>
                    </View>
                    :
                    <View></View>
                    }
                      <Text style={{fontSize:35}}>{emojis[Math.floor(Math.random() * emojis.length)]}</Text>
                    </Marker>
                  </View>
                )}
                {users.map((user: UserInfo, index: number) => (
                  <View key={index}>
                    <Marker
                      pinColor={'red'}
                      coordinate={{
                        latitude: user.location.latitude,
                        longitude: user.location.longitude,
                      }}
                      style={{justifyContent: "center", alignItems: "center"}}
                    >
                    { messages[user.id] ?
                    <View style={{left:-25, backgroundColor: "#fefefe", borderRadius:12, padding: 5}}>
                      <Text numberOfLines={5} style={{maxWidth:100}}>{messages[user.id]}</Text>
                    </View>
                    :
                    <View></View>
                    }       
                    </Marker>  
                  </View>                       
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
