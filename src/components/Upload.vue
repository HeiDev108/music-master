<template>
  <div class="bg-gray-800 text-gray-200 rounded border border-gray-700 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-700">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-yellow-500 text-2xl"></i>
      </div>
      <div class="p-6">
      <!-- Upload Dropbox -->
      <div
          class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed
          border-gray-400 text-gray-200 transition duration-500 hover:text-white
          hover:bg-green-400 hover:border-green-400 hover:border-solid"
          :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
          @drag.prevent.stop=""
          @dragstart.prevent.stop=""
          @dragend.prevent.stop="is_dragover = false"
          @dragover.prevent.stop="is_dragover = true"
          @dragenter.prevent.stop="is_dragover = true"
          @dragleave.prevent.stop="is_dragover = false"
          @drop.prevent.stop="uploadFile($event), updateUnsavedFlag(true)"
          >
          <h5>Drop your files here</h5>
      </div>
      <!-- File input -->
      <input class="text-gray-200 " type="file" multiple
        @change="uploadFile($event), updateUnsavedFlag(true)"/>
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm"
          :class="upload.text_class">
          <i :class="upload.icon"></i>{{ upload.name }}
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
        <!-- Inner Progress Bar -->
        <div class="transition-all "
          :class="[upload.variant, upload.progress_bar]"
          :style="{ width: upload.current_progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage, auth, songsCollection } from '@/includes/firebase';
import * as musicMetadata from 'music-metadata-browser';
import * as mimeTypes from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

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

export default {
  name: 'AppUpload',
  props: ['addSong', 'updateUnsavedFlag'],
  data() {
    return {
      is_dragover: false,
      uploads: [],
    };
  },
  methods: {
    async uploadToFirebase(payload) {
      // get music metadata to add to file songData
      const metaData = await musicMetadata.parseBlob(payload);
      // console.log(metaData);
      // set modified name to exclude file types. Regex replace extension
      const modifiedName = payload.name.replace(/\.[^.]*$/, '');

      const songMeta = {
        album: metaData.common.album ? metaData.common.album : '',
        artists: metaData.common.artists ? metaData.common.artists : [],
        disk: metaData.common.disk ? metaData.common.disk : '',
        genre: metaData.common.genre ? metaData.common.genre : '',
        title: metaData.common.title ? metaData.common.title : '',
        track: metaData.common.track ? metaData.common.track : '',
        year: metaData.common.year ? metaData.common.year : '',
        duration: metaData.format.duration ? metaData.format.duration : '',
      };

      const songData = {
        uid: auth.currentUser.uid,
        display_name: auth.currentUser.displayName,
        original_name: payload.name,
        modified_name: modifiedName,
        comment_count: 0,
        url: '',
        imageurl: '',
        metadata: songMeta,
      };

      // return if we're offline
      if (!navigator.onLine) {
        this.uploads.push({
          songTask: {},
          imageTask: {},
          current_progress: 100,
          name: payload.name,
          variant: 'bg-red-400',
          icon: 'fas fa-times',
          text_class: 'text-red-400',
        });
        return;
      }

      // generate uuid
      const uniqueID = uuidv4();
      songData.uniqueID = uniqueID;

      const storageRef = storage.ref(); // music-4bd4a.appspot.com
      const songsRef = storageRef.child(`songs/${uniqueID}/${payload.name}`);
      let imageRef = null;

      try {
        // start uploading song
        const songTask = songsRef.put(payload);
        let imageTask = null;
        // if we have an image file, upload image
        if (metaData.common.picture) {
          const blobExtension = mimeTypes.extension(metaData.common.picture[0].format);
          imageRef = storageRef.child(`songs/${uniqueID}/${songData.modified_name}.${blobExtension}`);
          // make image from metadata
          const pic = metaData.common.picture[0];
          const readBlob = new Blob([pic.data], { type: pic.format });

          // upload image
          imageTask = imageRef.put(readBlob);

          // eslint-disable-next-line no-unused-vars
          imageTask.on('state_changed', (blobsnap) => {
          }, (error) => {
            console.log(`image upload error: ${error}`);
          }, async () => {
            // add imageurl to songdata
            songData.imageurl = await imageTask.snapshot.ref.getDownloadURL();
          });
        }

        // set up audio upload tracking
        const uploadIndex = this.uploads.push({
          songTask,
          imageTask,
          current_progress: 0,
          name: payload.name,
          progress_bar: UploadTypes.PROGRESS_START,
          variant: UploadTypes.VARIANT_DEFAULT,
          icon: UploadTypes.ICON_DEFAULT,
          text_class: UploadTypes.TEXT_DEFAULT,
        }) - 1;

        songTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploads[uploadIndex].current_progress = progress;
        }, (error) => {
          // failure arrow function error handling
          this.uploads[uploadIndex].variant = UploadTypes.VARIANT_FAILURE;
          this.uploads[uploadIndex].icon = UploadTypes.ICON_FAILURE;
          this.uploads[uploadIndex].text_class = UploadTypes.TEXT_FAILURE;
          this.uploads[uploadIndex].progress_bar = UploadTypes.PROGRESS_END;
          console.log(error);

          // cancel image task.
          if (imageTask) {
            imageTask.cancel();
          }
          // remove image file if it has uploaded.
          if (imageRef) {
            imageRef.delete();
          }

          this.updateUnsavedFlag(false);
        }, async () => {
          // success arrow function -- must be async to allow for snapshot.ref.getDownloadURL
          songData.url = await songTask.snapshot.ref.getDownloadURL();

          // update song data to contain the URL as the file has been uploaded.
          const newDoc = await songsCollection.add(songData);
          const songSnapshot = await newDoc.get();

          this.updateUnsavedFlag(false);
          this.addSong(songSnapshot);

          this.uploads[uploadIndex].variant = UploadTypes.VARIANT_SUCCESS;
          this.uploads[uploadIndex].icon = UploadTypes.ICON_SUCCESS;
          this.uploads[uploadIndex].text_class = UploadTypes.TEXT_SUCCESS;
          this.uploads[uploadIndex].progress_bar = UploadTypes.PROGRESS_END;
        });
      } catch (error) {
        // delete song from files if it has uploaded
        await songsRef.delete();
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
      files.forEach((file) => {
        switch (file.type) {
          case 'audio/mpeg':
          case 'audio/flac': {
            this.uploadToFirebase(file);
            break;
          }

          default:
            // console.log(`invalid file type: ${file.type}`);
            break;
        }
      });
    },
  },
  beforeUnmount() {
    this.uploads.forEach((upload) => {
      upload.songTask.cancel();
      if (upload.imageTask) {
        upload.imageTask.cancel();
      }
    });
  },
};
</script>

<style>

</style>
