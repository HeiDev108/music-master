<template>
  <!-- Player -->
    <div class="fixed bottom-0 left-0 w-full bg-gray-800 flex items-center
       border-t border-gray-600">
      <!-- first box -->
        <div class="w-1/4 py-4 px-4 flex items-center">

          <div class="h-14 w-14 rounded overflow-hidden hidden md:block ">
            <img v-if="currentSong.imageurl" class="shadow-md"
              :src="currentSong.imageurl" alt="album image"
            />
          </div>
          <div v-if="currentSong.metadata" class="flex flex-col pl-4">
            <router-link :to="{ name: 'song', params: { id: currentSong.docID } }">
              <p class="song-title flex text-gray-100 text-sm">{{ currentSong.modified_name }}</p>
            </router-link>

            <p class="song-artist flex text-gray-400 text-xs">
              {{ currentSong.metadata.artists.toString().replace(/,/g, ', ') }}
            </p>
          </div>

        </div>
      <!-- second box -->
        <div class="w-1/2 h-full flex flex-col items-center">

          <div class="w-1/3 flex flex-row justify-around items-center">
            <button type="button"
              @click.prevent="previousSong"
              id="player-play-button">
              <i class="fa fa-step-backward text-gray-200 text-l py-2" ></i>
            </button>

            <button type="button"
              @click.prevent="toggleAudio"
              id="player-play-button">
              <i class="fa text-gray-200 text-l py-2"
                :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
            </button>

            <button type="button"
              @click.prevent="nextSong"
              id="player-play-button">
              <i class="fa fa-step-forward text-gray-200 text-l py-2" ></i>
            </button>
          </div>

          <div class="w-1/2 h-full w-full flex flex-col items-center">
            <div class="w-3/4 flex flex-row items-center">
              <span class="player-currenttime text-white pr-2">{{ seek }}</span>
              <!-- Scrub Container  -->
              <input class="block flex w-full h-2 rounded bg-gray-600 relative cursor-pointer
                border-gray-200"
                type="range" id="scrub" name="scrub" step="0.1" :value="(playerProgress * 100)"
                min="0" max="100"
                @mousedown="startScrubbing"
                @mouseup="stopScrubbing"
              />
              <span class="player-duration text-white pl-2">{{ duration }}</span>
            </div>
          </div>

        </div>
      <!-- third box -->
        <div class="w-1/4 h-full flex flex-col items-center">
          <div class="w-1/2 flex flex-row items-center">
          <!-- Queue link -->
          <router-link class=""
            :to="{ name: 'queue' }" exact-active-class="no-active">
            <i class="fas fa-list-ul mr-4 text-gray-200
              cursor-pointer transition duration-300 hover:text-yellow-500"></i>
          </router-link>

            <!-- Volume Container  -->
            <button type="button"
              @click.prevent="toggleMute"
              id="player-mute-button">
                <i class="fas text-gray-200 text-l pr-2
                  cursor-pointer transition duration-300 hover:text-yellow-500"
                  :class="{ 'fa-volume-up': !muted, 'fa-volume-mute': muted }"></i>
            </button>
            <input class="block flex w-full h-2 rounded bg-gray-600 relative cursor-pointer"
              type="range" id="vol" name="vol" step="1" v-model="volume" min="0" max="100"
              @update:model-value="updateVolume"
            />
          </div>
        </div>

  </div>

</template>

<script>
import {
  mapActions, mapGetters, mapState,
} from 'vuex';

export default {
  name: 'Player',
  data() {
    return {
      volumeDrag: false,
      seekDrag: false,
      mouseX: 0,
      volume: 100,
      scrub: 0,
    };
  },
  computed: {
    // mapGetters here as getters are effectively computed values
    ...mapGetters(['playing', 'volumePercent', 'muted', 'sound', 'playerProgress']),
    ...mapState({
      seek: (state) => state.player.seek,
      duration: (state) => state.player.duration,
      currentSong: (state) => state.player.currentSong,
    }),
  },
  methods: {
    ...mapActions(['toggleAudio', 'updateSeek', 'toggleMute', 'nextSong', 'previousSong', 'updateVolumeLevel', 'updateSeeking']),
    updateVolume(payload) {
      this.updateVolumeLevel(payload);
    },
    startScrubbing() {
      this.updateSeeking(true);
    },
    stopScrubbing(payload) {
      this.updateSeeking(false);
      this.updateSeek(payload.target.value);
    },
    updateScrub(payload) {
      this.updateSeek(payload.target.value);
    },
  },
};
</script>

<style>

</style>
