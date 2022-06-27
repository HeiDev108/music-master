<template>
  <div class="border border-gray-700 p-3 mb-4 rounded">
    <div v-show="!showForm">
    <h4 class="inline-block text-2xl font-bold"> {{ songData.modified_name }} </h4>
    <button class="ml-1 py-1 px-2 text-sm rounded text-gray-200 bg-red-600 float-right"
      @click.prevent="deleteSong">
        <i class="fa fa-times"></i>
    </button>
    <button class="ml-1 py-1 px-2 text-sm rounded text-gray-200 bg-blue-600 float-right"
      @click.prevent="showForm = !showForm">
        <i class="fa fa-pencil-alt"></i>
    </button>
    </div>
    <div v-show="showForm">
      <div class="text-gray-200 text-center font-bold p-4 mb-4" v-if="show_alert"
        :class="alert_variant">
        {{ alert_message }}
      </div>
      <vee-form :validation-schema="v_schema" :initial-values="songData"
        @submit="edit">
        <div class="mb-3">
        <label class="inline-block mb-2">Song Title</label>
        <vee-field type="text" name="modified_name"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300
            transition duration-500 focus:outline-none focus:border-black rounded
            bg-gray-200"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true) "/>
          <ErrorMessage class="text-red-600" name="modified_name" />
        </div>
        <div class="mb-3">
        <label class="inline-block mb-2">Genre</label>
        <vee-field type="text" name="metadata.genre"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300
            transition duration-500 focus:outline-none focus:border-black rounded
            bg-gray-200"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true) "/>
          <ErrorMessage class="text-red-600" name="genre" />
        </div>
        <label class="inline-block mb-2">Album Image</label>
        <div class="flex py-1.5">
          <img v-if="songData.imageurl"
            class="shadow-md h-24 w-24 rounded overflow-hidden hidden md:block"
            :src="songData.imageurl" alt="album image"
            />
          <h5 class="text-gray-200 py-8 text-center items-center" v-else>
            No album image uploaded
          </h5>
          <div
            class="py-8 px-6 rounded text-center cursor-pointer border border-dashed
            border-gray-400 text-gray-200 transition duration-500 hover:text-white
            hover:bg-green-400 hover:border-green-400 hover:border-solid"
            :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
            @drag.prevent.stop=""
            @dragstart.prevent.stop=""
            @dragend.prevent.stop="is_dragover = false"
            @dragover.prevent.stop="is_dragover = true"
            @dragenter.prevent.stop="is_dragover = true"
            @dragleave.prevent.stop="is_dragover = false"
            @drop.prevent.stop="uploadFile($event)"
            >
            <h5>Drop to replace album image</h5>
          </div>
        </div>
        <div v-if="upload.current_progress" class="py-1.5">
          <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
            <!-- Inner Progress Bar -->
            <div class="transition-all "
              :class="[upload.variant, upload.progress_bar]"
              :style="{ width: upload.current_progress + '%' }">
            </div>
          </div>
        </div>

        <button type="submit" class="py-1.5 px-3 rounded text-gray-200 bg-green-600"
        :disabled="in_submission">
        Submit
        </button>
        <button type="button" class="py-1.5 px-3 rounded text-gray-200 bg-gray-600"
        :disabled="in_submission" @click.prevent="showForm = false">
        Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>

<script>
import { songsCollection, storage } from '@/includes/firebase';
import * as mimeTypes from 'mime-types';

const UploadTypes = {
  VARIANT_DEFAULT: 'bg-blue-400',
  VARIANT_FAILURE: 'bg-red-400',
  VARIANT_SUCCESS: 'bg-green-400',
  TEXT_DEFAULT: '',
  TEXT_FAILURE: 'text-red-400',
  TEXT_SUCCESS: 'text-green-400',
  ICON_DEFAULT: 'fas fa-spinner fa-spin',
  ICON_FAILURE: 'fas fa-times',
  ICON_SUCCESS: 'fas fa-check',
  PROGRESS_START: 'progress-bar',
  PROGRESS_END: '',
};

const EditActionTypes = {
  SUBMIT_DEFAULT: 'bg-blue-500',
  SUBMIT_FAILURE: 'bg-red-500',
  SUBMIT_SUCCESS: 'bg-green-500',
  ALERT_MSG_DEFAULT: 'Updating song info. Please wait!',
  ALERT_MSG_FAILURE: 'An unexpected error occured. Please try again later',
  ALERT_MSG_SUCCESS: 'Success! Song info updated.',
};

export default {
  name: 'manage',
  // use props to validate array items
  props: {
    song: {
      type: Object,
      required: true,
    },
    updateSong: {
      type: Function,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    removeSong: {
      type: Function,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      songData: {
        ...this.song.data(),
      },
      showForm: false,
      v_schema: {
        modified_name: 'required',
        genre: 'alpha_spaces',
      },
      in_submission: false,
      show_alert: false,
      alert_variant: EditActionTypes.SUBMIT_DEFAULT,
      alert_message: EditActionTypes.ALERT_MSG_DEFAULT,
      upload: {},
      is_dragover: false,
    };
  },
  methods: {
    async edit(values) {
      this.in_submission = true;
      this.show_alert = true;
      this.alert_variant = EditActionTypes.SUBMIT_DEFAULT;
      this.alert_message = EditActionTypes.ALERT_MSG_DEFAULT;

      try {
        const data = values;
        data.imageurl = this.songData.imageurl;
        await songsCollection.doc(this.song.id).update(data);
      } catch (error) {
        console.log(error);
        this.in_submission = false;
        this.alert_variant = EditActionTypes.SUBMIT_FAILURE;
        this.alert_message = EditActionTypes.ALERT_MSG_FAILURE;
        return;
      }

      this.updateSong(this.index, values);
      this.updateUnsavedFlag(false);

      this.in_submission = false;
      this.alert_variant = EditActionTypes.SUBMIT_SUCCESS;
      this.alert_message = EditActionTypes.ALERT_MSG_SUCCESS;
    },
    async deleteSong() {
      const storageRef = storage.ref();
      const directoryRef = storageRef.child(`songs/${this.songData.uniqueID}/`);

      directoryRef.listAll().then((res) => {
        res.items.forEach((item) => {
          item.delete();
        });
      }).catch((error) => {
        console.log(error);
      });

      await songsCollection.doc(this.song.id).delete();
      this.removeSong(this.index);
    },
    async uploadToFirebase(payload) {
      const { songData } = this;
      songData.imageurl = '';

      const mime = mimeTypes.extension(payload.type);
      const storageRef = storage.ref(); // music-4bd4a.appspot.com
      const imageRef = storageRef.child(`songs/${songData.uniqueID}/${songData.modified_name}.${mime}`);

      // return if we're offline
      if (!navigator.onLine) {
        this.upload = {
          imageTask: {},
          current_progress: 100,
          name: payload.name,
          variant: 'bg-red-400',
          icon: 'fas fa-times',
          text_class: 'text-red-400',
        };
        return;
      }

      try {
        const imageTask = imageRef.put(payload);

        this.upload = {
          imageTask,
          current_progress: 0,
          name: payload.name,
          progress_bar: UploadTypes.PROGRESS_START,
          variant: UploadTypes.VARIANT_DEFAULT,
          icon: UploadTypes.ICON_DEFAULT,
          text_class: UploadTypes.TEXT_DEFAULT,
        };

        imageTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.upload.current_progress = progress;
        }, (error) => {
          this.upload.variant = UploadTypes.VARIANT_FAILURE;
          this.upload.icon = UploadTypes.ICON_FAILURE;
          this.upload.text_class = UploadTypes.TEXT_FAILURE;
          this.upload.progress_bar = UploadTypes.PROGRESS_END;
          console.log(error);

          if (imageTask) {
            imageTask.cancel();
          }
          if (imageRef) {
            imageRef.delete();
          }

          this.updateUnsavedFlag(false);
        }, async () => {
          songData.imageurl = await imageTask.snapshot.ref.getDownloadURL();
          await songsCollection.doc(this.song.id).update(songData);
          this.songData.imageurl = songData.imageurl;
          this.updateUnsavedFlag(false);

          this.upload.variant = UploadTypes.VARIANT_SUCCESS;
          this.upload.icon = UploadTypes.ICON_SUCCESS;
          this.upload.text_class = UploadTypes.TEXT_SUCCESS;
          this.upload.progress_bar = UploadTypes.PROGRESS_END;
        });
      } catch (error) {
        await imageRef.delete();
        console.error(error);
        this.updateUnsavedFlag(false);
      }
    },
    uploadFile($event) {
      this.is_dragover = false;
      this.updateUnsavedFlag(true);

      // turn uploaded files into array
      const files = $event.dataTransfer
        ? [...$event.dataTransfer.files]
        : [...$event.target.files];

      // do file validation using mime types
      this.uploadToFirebase(files[0]);
    },
  },
};
</script>

<style>

</style>
