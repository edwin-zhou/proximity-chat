import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, TextInput, Button} from "react-native";
import { io } from "socket.io-client";
import * as Location from 'expo-location';

export default function App() { 
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.00605,
    longitudeDelta: 0.000275,
  });

  const [text, onChangeText] = React.useState("");
  const socket = io("https://proximitychat.glcrx.com");
  function onSend() {
    if (text) {
      socket.emit("chat message", text);
    }
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      Location.watchPositionAsync({accuracy:6, distance: 1}, location => {
        console.log("location updated")
        setLocation(location);
        setMapRegion({
          latitude: Number(location.coords.latitude),
          longitude : Number(location.coords.longitude),
          latitudeDelta : mapRegion.latitudeDelta,
          longitudeDelta : mapRegion.longitudeDelta
        })
        socket.emit("position", location.coords.latitude, location.coords.longitude);
      });
    })();
  }, []);

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
        zoomEnabled={false}
        pitchEnabled={false}
        scrollEnabled={false}

        region={mapRegion}
        style={{ alignSelf: 'stretch', height: '100%' }}>
      </MapView>

      <Text>{ errorMsg }</Text>
      { !errorMsg && location && <Text>{location["coords"]["latitude"] + ", " +  location["coords"]["longitude"]}</Text>}
      { !errorMsg && !location && <Text>waiting...</Text>}
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


