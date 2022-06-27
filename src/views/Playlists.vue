<template>
  <main>
 <!-- Main Content -->
    <section class="container mx-auto">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200"
          v-icon-secondary="{ icon: 'headphones-alt', right: true }">
          <span class="card-title">Playlists</span>
          <!-- Icon -->

        </div>
        <!-- Playlist -->
        <ol id="playlist">
          <app-playlist-item v-for="playlist in playlists" :key="playlist.docID"
          :playlist="playlist"/>
        </ol>
        <!-- .. end Playlist -->
      </div>
    </section>
  </main>
</template>

<script>
// @ is an alias to /src
import { playlistsCollection } from '@/includes/firebase';
import AppPlaylistItem from '@/components/PlaylistItem.vue';
import IconSecondary from '@/directives/iconSecondary';

export default {
  name: 'Playlist',
  data() {
    return {
      playlists: [],
      maxPerPage: 8,
      pendingRequest: false,
    };
  },
  components: {
    AppPlaylistItem,
  },
  directives: {
    'icon-secondary': IconSecondary,
  },
  async created() {
    this.getPlaylists();

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
        this.getPlaylists();
      }
    },
    async getPlaylists() {
      if (this.pendingRequest) {
        return;
      }

      this.pendingRequest = true;
      let snapshots;

      if (this.playlists.length) {
      // get the document of the last song added to songs array
        const lastDoc = await playlistsCollection
          .doc(this.playlists[this.playlists.length - 1].docID)
          .get();

        // limit playlists to max per page to allow for pagination
        snapshots = await playlistsCollection
          .orderBy('name')
          .startAfter(lastDoc)
          .limit(this.maxPerPage)
          .get();
      } else {
        snapshots = await playlistsCollection
          .orderBy('name')
          .limit(this.maxPerPage)
          .get();
      }
      snapshots.forEach((document) => {
        this.playlists.push({
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
