import {Marker} from 'react-native-maps'

const avatar = 1

const MapService = {

    showMarker(location: {longitude: number, latitude: number}) {
        return <Marker
                coordinate={location}
                icon={avatar}
            >

            </Marker>   
    }

}

export default MapService