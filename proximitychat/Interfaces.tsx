export interface Position {
    longitude: number
    latitude: number
}

export interface UserInfo {
    id: string
    position: Position
}

export interface UserMessage {
    id: string
    message: string
}