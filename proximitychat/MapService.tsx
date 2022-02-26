import {Marker} from 'react-native-maps'
import { UserInfo} from './Interfaces'

const avatar = 1

const MapService = {

    showMarker(userInfo: UserInfo) {
        return <Marker
                coordinate={userInfo.location}
                icon={avatar}
            >

            </Marker>   
    }

}

export default MapService