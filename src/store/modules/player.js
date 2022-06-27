import { Howl } from 'howler';
import helper from '@/includes/helper';

export default {
  state: {
    currentSong: {}, // current song to play
    sound: {}, // sound object for howler to play
    seek: '00:00', // seek for audio file
    duration: '00:00', // audio file duration
    playerProgress: 0,
    seeking: false,
    volume: 1,
    mute: false,
    queue: {
      index: 0,
      list: [],
      repeat: false,
    },
  },
  getters: {
    playing: (state) => {
      if (state.sound.playing) {
        return state.sound.playing();
      }

      return false;
    },
    currentSong: (state) => state.currentSong,
    seek: (state) => state.seek,
    duration: (state) => state.duration,
    playerProgress: (state) => state.playerProgress,
    volumePercent: (state) => state.volume * 100,
    currentQueue: (state) => state.queue,
    muted: (state) => state.mute,
    queue: (state) => state.queue,
    compareSong: (state, payload) => state.currentSong === payload,
    sound: (state) => state.sound,
  },
  mutations: {
    updatePosition(state) {
      state.seek = helper.formatTime(state.sound.seek());
      state.duration = helper.formatTime(state.sound.duration());
      state.playerProgress = (state.sound.seek() / state.sound.duration());

      sessionStorage.setItem('seek', state.sound.seek());
    },
    setplayerProgress(state, payload) {
      state.playerProgress = payload;
    },
    resetQueue(state) {
      const newQueue = {
        index: 0,
        list: [],
        repeat: false,
      };
      state.queue = newQueue;
    },
    addSongToQueue(state, payload) {
      state.queue.list.push(payload);
    },
    updateQueue(state, payload) {
      state.queue = payload;
    },
    setVolume(state, payload) {
      state.volume = payload;
      sessionStorage.setItem('volume', payload);

      if (state.sound instanceof Howl) {
        state.sound.volume(payload);
      }
    },
    setMute(state, payload) {
      state.mute = payload;
    },
    setSound(state, payload) {
      state.sound = payload;
    },
    setCurrentSong(state, payload) {
      state.currentSong = payload;
    },
    setSeeking(state, payload) {
      state.seeking = payload;
    },
  },
  actions: {
    init_player({ state, commit, dispatch }) {
      const sessionVolume = sessionStorage.getItem('volume');
      const sessionQueue = JSON.parse(sessionStorage.getItem('queue'));
      // const sessionSound = sessionStorage.getItem('sound');
      const sessionSeek = sessionStorage.getItem('seek');

      if (sessionVolume !== null) {
        commit('setVolume', sessionVolume);
      }

      if (sessionQueue) {
        commit('updateQueue', sessionQueue);

        const { list, index, repeat } = sessionQueue;

        // eslint-disable-next-line no-unused-vars
        const newSound = new Howl({
          src: list[index].url,
          preload: true,
          html5: true,
          volume: sessionVolume,

          onend: () => {
            if ((index + 1) === list.length) {
              state.queue.index = 0;
              if (repeat) {
                dispatch('autoplay');
              }
            } else {
              state.queue.index += 1;
              dispatch('autoplay');
            }
          },
          onload: () => {
            commit('setCurrentSong', list[index]);
            commit('setSound', newSound);
            state.sound.seek(sessionSeek);
            commit('updatePosition');
          },
          onplay: () => {
            commit('setCurrentSong', list[index]);
            requestAnimationFrame(() => {
              dispatch('progress');
            });
          },
        });
      }
    },
    async playSong({ commit, state, dispatch }, payload) {
      if (state.sound instanceof Howl) {
        state.sound.unload();
      }

      commit('resetQueue');
      commit('addSongToQueue', payload);
      dispatch('autoplay');
    },
    toggleAudio({ state }) {
      // return if there is no playing function on sound (audio not loaded)
      if (!state.sound.playing) {
        return;
      }
      // check if audio is playing
      if (state.sound.playing()) {
        state.sound.pause();
      } else {
        state.sound.play();
      }
    },
    nextSong({ state, dispatch }) {
      const { list, index } = state.queue;
      if (state.sound.playing) {
        state.sound.stop();
        state.queue.index += 1;
        if ((index + 1) === list.length) {
          state.queue.index = 0;
        }
        dispatch('autoplay');
      }
    },
    previousSong({ state, dispatch }) {
      if (state.sound.playing) {
        state.sound.stop();
        state.queue.index -= 1;

        if (state.queue.index < 0) {
          state.queue.index = state.queue.list.length - 1;
        }

        dispatch('autoplay');
      }
    },
    progress({ commit, state, dispatch }) {
      if (!state.seeking) {
        commit('updatePosition');
      }

      if (state.sound.playing()) {
        requestAnimationFrame(() => {
          dispatch('progress');
        });
      }
    },
    updateSeek({ state, dispatch }, payload) {
      // do nothing if we haven't loaded any music
      if (!state.sound) {
        return;
      }

      // const { x, width } = payload.currentTarget.getBoundingClientRect();

      // // have to get the location on timeline relative to document edge
      // // eg docwidth = 2000, timeline = 1000, click = 500, distance = 500
      // const clickX = payload.clientX - x;
      // const percentage = clickX / width;
      const seconds = state.sound.duration() * (payload / 100);
      console.log(seconds);
      state.sound.seek(seconds);

      state.sound.once('seek', () => {
        dispatch('progress');
      });
    },
    // eslint-disable-next-line no-unused-vars
    updateVolume({ state, commit }, payload) {
      const { x, width } = payload.currentTarget.getBoundingClientRect();
      const clickX = payload.clientX - x;
      const percentage = clickX / width;
      const volume = 1 * percentage;

      // save volume to maintain volume while changing songs
      commit('setVolume', volume);
    },
    updateVolumeLevel({ state, commit }, payload) {
      // save volume to maintain volume while changing songs
      // payload is input range 0-100. Divide by 100 to make range 0-1
      commit('setVolume', (payload / 100));

      if (state.sound instanceof Howl) {
        state.sound.volume(payload);
      }
    },
    toggleMute({ commit, state }) {
      const mute = !state.mute;

      commit('setMute', mute);

      if (state.sound instanceof Howl) {
        state.sound.mute(mute);
      }
    },
    updatePlayerProgress({ commit }, payload) {
      // payload is input range 0-100. Divide by 100 to make range 0-1
      commit('setplayerProgress', (payload / 100));
    },
    playSongAtIndex({ state, dispatch }, payload) {
      if (state.sound instanceof Howl) {
        state.sound.pause();
        state.queue.index = payload;
        dispatch('autoplay');
      }
    },
    updateSeeking({ commit }, payload) {
      commit('setSeeking', payload);
    },
    // eslint-disable-next-line no-unused-vars
    async autoplay({ commit, state, dispatch }) {
      const { list, index, repeat } = state.queue;
      const queueObj = JSON.stringify(state.queue);
      sessionStorage.setItem('queue', queueObj);

      const newSound = new Howl({
        src: list[index].url,
        preload: true,
        html5: true,
        volume: state.volume,
        mute: state.mute,
        onend: () => {
          if ((index + 1) === list.length) {
            state.queue.index = 0;
            if (repeat) {
              dispatch('autoplay');
            }
          } else {
            state.queue.index += 1;
            dispatch('autoplay');
          }
        },
        onload: () => {
          commit('setCurrentSong', list[index]);
        },
        onplay: () => {
          commit('setCurrentSong', list[index]);
          requestAnimationFrame(() => {
            dispatch('progress');
          });
        },
      });

      commit('setSound', newSound);

      // eslint-disable-next-line no-unused-expressions
      repeat && index === 0 ? state.sound.stop() : state.sound.play();
    },
  },
};
