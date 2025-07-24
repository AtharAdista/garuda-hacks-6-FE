export interface StreamDataItem {
  province: string;
  media_type: string;
  media_url: string;
  cultural_category: string;
  query: string;
  cultural_context: string;
}

export interface StreamErrorItem {
  detail: string;
}

export type DisplayState = 
  | 'idle'
  | 'initial_loading'
  | 'displaying'
  | 'inter_loading'
  | 'completed'
  | 'error';

export interface CulturalDisplayState {
  currentIndex: number;
  displayState: DisplayState;
  timeRemaining: number;
  totalItems: number;
}