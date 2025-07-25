export interface RoomEventPayload {
  roomId: string;
  userId: string;
  health?: number;
}

export interface RoomDataPayload {
  roomId: string;
  players: {
    [userId: string]: {
      userId: string;
      health?: number;
    };
  };
  playerCount: number;
}

export interface PlayerLeftPayload {
  userId: string;
}

export interface GameStartedPayload {
  roomId: string;
}

export interface PlayerData {
  userId: string;
  health: number;
}

export interface GameOverData {
  winner: string;
  players: any[];
}