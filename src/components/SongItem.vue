<template>
  <li class="flex justify-between items-center p-3 pl-6 cursor-pointer transition
          duration-300 hover:bg-gray-50"
          :id="`song-id-${song.docID}`">

    <div class="inline-flex">
      <!-- Play/Pause Button -->
      <div class="text-gray-600 text-lg pr-5">
        <button type="button" class="play-button"
          @click.prevent="tryPlaying(song)">
        <i class="fas text-gray-500"
          :class="{ 'fa-play': (!playing || currentSong.url !== song.url),
          'fa-pause': (playing && currentSong.url === song.url) }"></i>
        </button>
      </div>

      <div>
        <router-link :to="{ name: 'song', params: { id: song.docID } }"
          class="font-bold block text-gray-600 song-name">
          {{ song.modified_name }}
        </router-link>

        <span class="text-gray-500 text-sm">
          {{ song.metadata.artists.toString().replace(/,/g, ', ') }}
        </span>
      </div>
    </div>

    <div class="text-gray-600 text-lg">
      <!-- set router link to custom hash location -->
      <router-link
        :to="{ name: 'song', params: { id: song.docID }, hash: '#comments' }"
        :v-slot="{ }">
        <span class="comments" @click="navigate">
          <i class="fa fa-comments text-gray-600 "></i>
          {{ song.comment_count }}
        </span>
      </router-link>
    </div>
  </li>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'SongItem',
  props: ['song'],
  computed: {
    ...mapGetters(['currentSong', 'playing']),
  },
  methods: {
    ...mapActions(['playSong', 'toggleAudio']),
    tryPlaying(song) {
      if (this.currentSong.url === song.url) {
        this.toggleAudio();
      } else {
        this.playSong(song);
      }
    },
  },
};
</script>

<style>

</style>
