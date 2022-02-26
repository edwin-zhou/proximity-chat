export interface Location {
    longitude: number
    latitude: number
}

export interface UserInfo {
    id: string
    location: Location
}

export interface UserMessage {
    id: string
    message: string
}

export interface User {
    id: string,
    location: Location,
    message: string,
}