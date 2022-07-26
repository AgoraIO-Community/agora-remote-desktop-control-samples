export const RESOLUTION_BITRATE: {
  [key: string]: {
    width: number;
    height: number;
    bitrate: number;
  };
} = {
  '480p600': { width: 848, height: 480, bitrate: 1200 },
  '720p1000': { width: 1280, height: 720, bitrate: 2400 },
  '1080p2000': { width: 1920, height: 1080, bitrate: 4000 },
};

export const FRAME_RATES: number[] = [10, 15, 30, 60];