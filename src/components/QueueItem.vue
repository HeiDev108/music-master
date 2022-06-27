<template>
  <!-- container -->
  <li v-show="showItem"
    class="flex justify-between items-center p-3 pl-6 cursor-pointer transition
          duration-300 hover:bg-gray-700 rounded"
          :id="`song-id-${song.docID}`">
    <div class="inline-flex items-center">
      <span class="text-gray-400 text-lg mr-2 flex align-middle"> {{ index + 1 }} </span>
      <!-- Play/Pause Button -->
      <div class="text-gray-600 text-lg mr-5">
        <button type="button" class="play-button"
          @click.prevent="tryPlaying(song, index)">
        <i class="fas text-gray-400"
          :class="{ 'fa-play': (!playing || currentSong.url !== song.url),
          'fa-pause': (playing && currentSong.url === song.url) }"></i>
        </button>
      </div>
      <div class="h-14 w-14 rounded md:block mr-2">
            <img v-if="song.imageurl" class="shadow-md"
              :src="song.imageurl" alt="album image"
            />
      </div>

      <div>
        <router-link :to="{ name: 'song', params: { id: song.docID } }"
          class="font-bold block text-gray-100 song-name">
          {{ song.modified_name }}
        </router-link>

        <span v-show="song" class="text-gray-400 text-sm">
          {{ artists }}
        </span>
      </div>
    </div>

    <div class="text-gray-400 text-lg">
      <span class="duration"> {{ duration }} </span>
    </div>
  </li>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import helper from '@/includes/helper';

export default {
  name: 'QueueItem',
  props: ['song', 'index', 'show'],
  computed: {
    ...mapGetters(['currentSong', 'playing', 'queue']),
    duration() {
      return helper.formatTime(this.song.metadata.duration);
    },
    showItem() {
      return (this.index > (this.queue.index) || this.show);
    },
    artists() {
      return (this.song.metadata.artists.toString().replace(/,/g, ', '));
    },
  },
  methods: {
    ...mapActions(['newSong', 'toggleAudio', 'playSongAtIndex']),
    tryPlaying(song, index) {
      if (this.currentSong.url === song.url) {
        this.toggleAudio();
      } else {
        this.playSongAtIndex(index);
      }
    },
  },
};
</script>

<style>

</style>
