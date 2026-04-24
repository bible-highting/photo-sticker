export type StickerType = 'text' | 'speech_bubble';
export type FontType = 'Rimgul' | 'OmuDaye' | 'NanumBarunGothic';

export interface StickerData {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  text: string;
  fontFamily: FontType;
  fontSize: number;
  fill: string;
  hasShadow?: boolean;
  stroke?: string;
  strokeWidth?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
}
