export const RESOLUTION_BITRATE: {
  [key: string]: {
    width: number;
    height: number;
    bitrate: number;
  };
} = {
  '480p600': { width: 848, height: 480, bitrate: 600 },
  '720p1000': { width: 1280, height: 720, bitrate: 1000 },
  '1080p2000': { width: 1920, height: 1080, bitrate: 2000 },
};
