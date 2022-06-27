<template>
  <main>
    <section class="container mx-auto">
      <div class="bg-gray-800 rounded border-gray-900 border-2 relative flex flex-col p-2">
        <h1 class="text-gray-200 text-xl">{{ playlist.name }}</h1>
        <!-- Queue list -->
        <ol id="playlist" class="">
          <app-queue-item v-for="(song, index) in songs" :key="song.docID"
          :song="song" :position="(index + 1)" :index="index"/>
        </ol>
        <!-- end  -->

      </div>

    </section>

  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { playlistsCollection, songsCollection } from '@/includes/firebase';
import AppQueueItem from '@/components/QueueItem.vue';
import AppSongItem from '@/components/SongItem.vue';

export default {
  name: 'QueueItem',
  props: [''],
  data() {
    return {
      playlist: {},
      songs: [],
    };
  },
  // can do this on create, but create will show page before data is loaded. Data will pop in
  // when using create, replace 'to' with 'this.$route'
  async beforeRouteEnter(to, from, next) {
    const playlistSnapshot = await playlistsCollection.doc(to.params.id).get();

    // call next because async tasks are over. Can reference data with vm instead of 'this'
    next((vm) => {
      //    if the song is invalid for some reason, redirect home
      if (!playlistSnapshot.exists) {
        vm.$router.push({ name: 'home' });
        return;
      }
      // eslint-disable-next-line no-param-reassign
      vm.playlist = playlistSnapshot.data();

      vm.getPlaylistSongs(vm.playlist.songs);
    });
  },

  components: {
    AppQueueItem,
    // eslint-disable-next-line vue/no-unused-components
    AppSongItem,
  },
  computed: {
    ...mapGetters(['currentSong', 'playing', 'queue']),
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
    async getPlaylistSongs(songs) {
      const snapshots = await songsCollection.get();

      songs.forEach((song) => {
        snapshots.forEach((songDoc) => {
          if (songDoc.id === song) {
            this.songs.push({
              docID: songDoc.id,
              ...songDoc.data(),
            });
          }
        });
      });
    },
  },
};
</script>

<style>

</style>
