<template>
  <main>
    <section class="container mx-auto">
      <div v-if="queue.list.length"
        class="bg-gray-800 rounded border-gray-900 border-2 relative flex flex-col p-2">
        <h1 class="text-gray-200 text-xl">Queue</h1>
        <!-- now playing -->
        <div>
          <span class="text-gray-200 text-md pt-4">Now playing</span>
          <app-queue-item v-show="currentSong"
            :song="currentSong" :index="this.queue.index" :show="true"/>

          <span class="text-gray-200 text-md pt-4">Playing next</span>
          <!-- Queue list -->
          <ol id="playlist" class="">
            <app-queue-item v-for="(song, index) in currentQueue" :key="song.docID"
            :song="song" :index="index" :show="false"/>
          </ol>
          <!-- end  -->
        </div>
      </div>

    </section>

  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import AppQueueItem from '@/components/QueueItem.vue';

export default {
  name: 'Queue',
  props: [''],
  components: {
    AppQueueItem,
    // eslint-disable-next-line vue/no-unused-components
  },
  computed: {
    ...mapGetters(['currentSong', 'playing', 'queue']),
    currentQueue() {
      // eslint-disable-next-line no-unused-vars
      const { list, index } = this.queue;
      const curQueue = list; // list.slice(index + 1);
      return curQueue;
      // return this.queue.list;
    },
  },
};

/*

<div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
        </div>
        <div v-if="getCoverImage(song)" class="z-50 h-24 w-24 pl-5 items-center flex">
          <img :src="getCoverImage(song)" alt="..."
            class="shadow-lg rounded max-w-full h-auto align-middle border-none" />
        </div>

*/
</script>

<style>

</style>
