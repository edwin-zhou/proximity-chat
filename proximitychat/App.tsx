import React, {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, TextInput} from "react-native";
import SocketService from './SocketService';
import {Divider, Appbar, Button} from 'react-native-paper'

export default function App() {
  useEffect(() => {
    SocketService.onReceiveLocation()
    SocketService.onReceiveMessage()
  })

  const [mapRegion, setmapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [text, onChangeText] = React.useState("");


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "stretch",
      justifyContent: "space-evenly",
    },
  });

  function handleSendMessage() {
    SocketService.onSend(text)
  }

  return (
    <View style={{height: "100%"}}>
      <MapView
        region={mapRegion}
        style={{height: "92%"}}>
      </MapView>
      {/* <Divider></Divider> */}

      <View style={{alignItems: "center"}}>
        <TextInput
          value={text}
          placeholder="Send a message"
          onChangeText={onChangeText}
        />

        <Button 
          icon="send"
          disabled={text.trim().length === 0}
          onPress={handleSendMessage} 
          >

        </Button>
      </View>





      <StatusBar style="auto" />
    </View>
  );
}


