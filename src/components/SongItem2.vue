<template>
  <!-- container -->
  <div class="w-full col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
    pt-2 px-2 flex flex-wrap max-w-md md:max-w-full">

    <!-- invidivual container -->
    <div class="w-full flex flex-wrap aspect-w-3 aspect-h-4 justify-between">
      <article class="overflow-hidden rounded-lg shadow-lg
        border-4 border-opacity-0 hover:border-opacity-80 bg-gray-700">
        <!-- link -->
        <router-link class=""
          :to="{ name: 'song', params: { id: song.docID } }">
          <!-- image -->
          <div class="aspect-w-1 aspect-h-1">
            <img class="object-cover p-2"
              :src="song.imageurl ? song.imageurl : defaultImage" alt="album image"
              />
          </div>
        </router-link>

        <!-- title and artist -->
        <div class="flex flex-col justify-between ">
          <div class="flex items-center px-2 py-2">
            <h1 class="text-md text-gray-100 md:text-sm">{{ song.modified_name }}</h1>
          </div>
          <div class="flex items-center px-2 text-gray-400 justify-between">
            <!-- todo: router link to artist page -->
            <h2 class="text-xs">
              {{ song.metadata.artists.length > 0 ?
                song.metadata.artists.toString().replace(/,/g, ', ') : 'No Artist' }}
            </h2>

            <div class="flex text-lg pl-2 float-right align-self-right">
              <button type="button" class="add-button pr-2"
                @click.prevent="addSong(song)">
              <i class="fas fa-plus text-gray-400"></i>
              </button>
              <button type="button" class="play-button "
                @click.prevent="tryPlaying(song)">
              <i class="fas"
                :class="{ 'fa-play text-gray-400': (!playing || currentSong.url !== song.url),
                'fa-pause text-gray-100': (playing && currentSong.url === song.url) }"></i>
              </button>
            </div>
          </div>
        </div>

      <!-- upload time? play button -->

      </article>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'SongItem',
  props: ['song'],
  data() {
    return {
      defaultImage: 'https://firebasestorage.googleapis.com/v0/b/music-4bd4a.appspot.com/o/songs%2Fdefault%2Fdefault.png?alt=media&token=8226fffd-976c-4112-bc4a-d808eb7d941d',
    };
  },
  computed: {
    ...mapGetters(['currentSong', 'playing']),
  },
  methods: {
    ...mapMutations(['addSongToQueue']),
    ...mapActions(['playSong', 'toggleAudio']),
    tryPlaying(song) {
      if (this.currentSong.url === song.url) {
        this.toggleAudio();
      } else {
        this.playSong(song);
      }
    },
    addSong(song) {
      this.addSongToQueue(song);
    },
  },
};
</script>

<style>

</style>
