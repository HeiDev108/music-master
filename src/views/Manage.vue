<template>
   <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload"
          :addSong="addSong"
          :updateUnsavedFlag="updateUnsavedFlag"
          />
      </div>
      <div class="col-span-2">
        <div class="bg-gray-800 rounded border border-gray-700 relative flex flex-col
          text-gray-200">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-700">
            <span class="card-title">My Songs</span>
            <i class="fa fa-compact-disc float-right text-yellow-500 text-2xl"></i>
          </div>
          <div class="p-6 text-gray-200">
            <!-- Composition Items -->
            <composition-item v-for="(song, i) in songs" :key="song.id"
              :song="song"
              :updateSong="updateSong"
              :index="i"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
              />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AppUpload from '@/components/Upload.vue';
import CompositionItem from '@/components/CompositionItem.vue';
import { songsCollection, auth } from '@/includes/firebase';

export default {
  name: 'manage',
  components: {
    AppUpload,
    CompositionItem,
  },
  data() {
    return {
      songs: [],
      unsavedFlag: false,
      uploadInfo: {},
    };
  },
  async created() {
    // firebase where(name of property, comparison operator, value to compare to)
    const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid)
      .get();

    snapshot.forEach(this.addSong);
  },
  methods: {
    updateSong(i, values) {
      this.songs[i].modified_name = values.modified_name;
      this.songs[i].genre = values.genre;
    },
    removeSong(i) {
      this.songs.splice(i, 1);
    },
    addSong(document) {
      this.songs.push(document);
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.unsavedFlag) {
      next();
    } else {
      // eslint-disable-next-line no-alert, no-restricted-globals
      const leave = confirm('You have unsaved changes. Are you sure you want to leave?');
      next(leave);
    }
  },
};
</script>

<style>

</style>
