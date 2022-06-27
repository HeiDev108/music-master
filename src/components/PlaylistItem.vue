<template>
  <router-link :to="{ name: 'playlist', params: { id: playlist.docID } }"
    class="font-bold playlist-name
      flex justify-between items-center cursor-pointer transition
      duration-300 hover:bg-gray-700 rounded">
    <li class="p-3 pl-6"
      :id="`playlist-id-${playlist.docID}`">
      <div class="inline-flex items-center justify-between">
        <span class="text-gray-400 text-lg flex">
          {{ playlist.name }}
        </span>
        <span class="text-gray-400 text-lg flex">
        {{ numSongs }}
        </span>
      </div>
    </li>
  </router-link>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'PlaylistItem',
  props: ['playlist'],
  computed: {
    ...mapGetters(['currentSong', 'playing']),
    numSongs() {
      return this.playlist.songs.length;
    },
  },
  methods: {
    ...mapActions(['playSongAtIndex', 'toggleAudio']),
    tryPlaying(song) {
      if (this.currentSong.url === song.url) {
        this.toggleAudio();
      } else {
        this.playSongAtIndex(song);
      }
    },
  },
};
</script>

<style>

</style>
