<template>
  <main>
      <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)">
      </div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button type="button" class="z-50 h-24 w-24 text-3xl bg-gray-800 text-gray-100 rounded-full
          focus:outline-none"
          @click.prevent="tryPlaying(song)"
          id="play-button">
          <i class="fas"
            :class="{ 'fa-play': (!playing || currentSong.url !== song.url),
            'fa-pause': (playing && currentSong.url === song.url) }"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
        </div>
        <div v-if="getCoverImage(song)" class="z-50 h-24 w-24 pl-5 items-center flex">
          <img :src="getCoverImage(song)" alt="..."
            class="shadow-lg rounded max-w-full h-auto align-middle border-none" />
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-gray-800 rounded border border-gray-700 relative flex flex-col
        text-gray-100">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-700">
          <!-- Comment Count -->
          <span class="card-title">Comments ({{ song.comment_count }})</span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div class="text-white text-center font-bold p4 mb-4"
            v-if="comment_show_alert"
            :class="comment_alert_variant">
            {{ comment_alert_msg }}
          </div>
          <vee-form v-if="userLoggedIn"
            :validation-schema="comment_schema"
            @submit="addComment">
            <vee-field type="textarea" name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-700 transition
                duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button type="submit"
              :disabled="comment_in_submission"
              class="py-1.5 px-3 rounded text-white bg-green-600 block">
              Submit
            </button>
          </vee-form>
          <!-- Sort Comments -->
          <select v-model="sort"
            class="block mt-4 py-1.5 px-3 bg-gray-800 text-gray-100 border
            border-gray-700 transition duration-100 focus:outline-none focus:border-black rounded">
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
      <li class="p-6 bg-gray-800 border border-gray-700 text-gray-200"
        v-for="comment in sortedComments"
        :key="comment.docID">
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold text-xl">{{ comment.name }}</div>
          <time class="text-gray-400 text-sm">{{ comment.datePosted }}</time>
        </div>

        <p> {{ comment.content }} </p>
      </li>
    </ul>
  </main>
</template>

<script>
import { songsCollection, commentsCollection, auth } from '@/includes/firebase';
import { mapState, mapActions, mapGetters } from 'vuex';

const CommentActionTypes = {
  COMMENT_DEFAULT: 'bg-blue-500',
  COMMENT_FAILURE: 'bg-red-500',
  COMMENT_SUCCESS: 'bg-green-500',
  COMMENT_MSG_DEFAULT: 'Your comment is being submitted. Please wait! ',
  COMMENT_MSG_FAILURE: 'There was an error submitting this comment. Please try again later.',
  COMMENT_MSG_SUCCESS: 'Success! Your comment has been submitted.',
};

export default {
  name: 'Song',
  data() {
    return {
      song: {},
      comments: [],
      comment_schema: {
        comment: 'required|min:3',
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: CommentActionTypes.COMMENT_DEFAULT,
      comment_alert_msg: CommentActionTypes.COMMENT_MSG_DEFAULT,
      sort: '1',
    };
  },
  // can do this on create, but create will show page before data is loaded. Data will pop in
  // when using create, replace 'to' with 'this.$route'
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await songsCollection.doc(to.params.id).get();

    // call next because async tasks are over. Can reference data with vm instead of 'this'
    next((vm) => {
      //    if the song is invalid for some reason, redirect home
      if (!docSnapshot.exists) {
        vm.$router.push({ name: 'home' });
        return;
      }

      const { sort } = vm.$route.query;

      // eslint-disable-next-line no-param-reassign
      vm.sort = sort === '1' || sort === '2' ? sort : '1';

      // eslint-disable-next-line no-param-reassign
      vm.song = docSnapshot.data();
      vm.getComments();
    });
  },
  computed: {
    ...mapState({
      userLoggedIn: (state) => state.auth.userLoggedIn,
    }),
    ...mapGetters(['playing', 'currentSong']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        switch (this.sort) {
          case '1':
            return new Date(b.datePosted) - new Date(a.datePosted);

          case '2':
            return new Date(a.datePosted) - new Date(b.datePosted);

          default:
            return null;
        }
      });
    },
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
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.comment_alert_variant = CommentActionTypes.COMMENT_DEFAULT;
      this.comment_alert_msg = CommentActionTypes.COMMENT_MSG_DEFAULT;

      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
      };

      await commentsCollection.add(comment);

      // use counter to track number of comments - simpler and less queries even if not ideal
      this.song.comment_count += 1;
      await songsCollection.doc(this.$route.params.id).update({
        comment_count: this.song.comment_count,
      });

      this.getComments();

      this.comment_in_submission = false;
      this.comment_alert_variant = CommentActionTypes.COMMENT_SUCCESS;
      this.comment_alert_msg = CommentActionTypes.COMMENT_MSG_SUCCESS;
      resetForm();
    },
    async getComments() {
      const snapshots = await commentsCollection
        .where('sid', '==', this.$route.params.id).get();

      this.comments = [];

      snapshots.forEach((doc) => [
        this.comments.push({
          docID: doc.id,
          ...doc.data(),
        }),
      ]);
    },
    getCoverImage(song) {
      return song.imageurl;
    },
  },
  watch: {
    sort(newVal) {
      // prevent page reloading if value hasn't changed
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
};
</script>
