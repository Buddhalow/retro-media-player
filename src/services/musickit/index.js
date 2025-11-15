export class MusicKitService {
  constructor() {
    this.cache = {};
    this.isPlaying = false;
    this.id = 'spotify'
    this.resources = {};
    this.callbacks = {};

    this.me = null;
    this.cache = {};

    this.player = window.spotifyPlayer;
  }
  initPlayer() {
    document.addEventListener('musickitloaded', async function () {
      // Call configure() to configure an instance of MusicKit on the Web.
      try {
        await MusicKit.configure({
          developerToken: 'DEVELOPER-TOKEN',
          app: {
            name: 'My Cool Web App',
            build: '1978.4.1',
          },
        });
      } catch (err) {
        // Handle configuration error
      }

      // MusicKit instance is available
      const music = MusicKit.getInstance();
    });
  }
}

export const instance = new MusicKitService();

export function getDefaultInstance() {
  return instance;
}
