<template>
  <main>
    <!-- Introduction -->
    <section class="mb-8 py-20 text-white text-center relative">
      <div class="absolute inset-0 w-full h-full bg-contain introduction-bg"
        style="background-image: url(assets/img/song-header.png)"></div>
      <div class="container mx-auto">
        <div class="text-white main-header-content">
          <h1 class="font-bold text-5xl mb-5 text-gray-100">Listen to Great Music!</h1>
          <p class="w-full md:w-8/12 mx-auto text-gray-200">
            This site is an example of a music sharing site. Anyone can listen to
            the music uploaded to the site. To upload music, one must register and
            log in. Once uploaded, the music is made public for anyone to listen.
            Users who are logged in can comment on songs.
          </p>
        </div>
      </div>

      <img class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
        src="assets/img/introduction-music.png" />
    </section>

    <!-- Main Content -->
    <section class="container mx-auto">
      <div class="bg-gray-800 rounded border-gray-900 border-2 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b-2 border-gray-900 text-gray-200"
          v-icon-secondary.yellow="{ icon: 'headphones-alt', right: true}">
          <span class="card-title">Songs</span>
          <!-- Icon -->

        </div>
        <!-- Playlist -->
        <ol id="playlist" class="grid grid-cols-12 gap-3 w-full justify-center content-center pb-4">
          <app-song-item v-for="song in songs" :key="song.docID"
          :song="song"/>
        </ol>
        <!-- .. end Playlist -->
      </div>
    </section>
  </main>
</template>

<script>
// @ is an alias to /src
import { songsCollection } from '@/includes/firebase';
import AppSongItem from '@/components/SongItem2.vue';
import IconSecondary from '@/directives/iconSecondary';

export default {
  name: 'Home',
  data() {
    return {
      songs: [],
      maxPerPage: 12,
      pendingRequest: false,
    };
  },
  components: {
    AppSongItem,
  },
  directives: {
    'icon-secondary': IconSecondary,
  },
  async created() {
    this.getSongs();

    // listen to scroll event
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // remove event listeners before unmounting
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      const { scrollTop, offsetHeight } = document.documentElement;
      const { innerHeight } = window;
      const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

      if (bottomOfWindow) {
        this.getSongs();
      }
    },
    async getSongs() {
      if (this.pendingRequest) {
        return;
      }

      this.pendingRequest = true;
      let snapshots;

      if (this.songs.length) {
      // get the document of the last song added to songs array
        const lastDoc = await songsCollection
          .doc(this.songs[this.songs.length - 1].docID)
          .get();

        // limit songs to max per page to allow for pagination
        snapshots = await songsCollection
          .orderBy('modified_name')
          .startAfter(lastDoc)
          .limit(this.maxPerPage)
          .get();
      } else {
        snapshots = await songsCollection
          .orderBy('modified_name')
          .limit(this.maxPerPage)
          .get();
      }
      snapshots.forEach((document) => {
        this.songs.push({
          docID: document.id,
          ...document.data(),
        });
      });

      // list number of songs fetched
      // console.log(snapshots.size);

      this.pendingRequest = false;
    },
  },
};
</script>
