import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBcOeO0ogPZS0v8tuDo6EpjhxlbXpgkVKw',
  authDomain: 'music-4bd4a.firebaseapp.com',
  projectId: 'music-4bd4a',
  storageBucket: 'music-4bd4a.appspot.com',
  appId: '1:1029460595088:web:639c0d93abe60801702315',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

db.enablePersistence().catch((error) => {
  console.log(`Firebase persistence error: ${error.code}`);
});

const usersCollection = db.collection('users');
const songsCollection = db.collection('songs');
const commentsCollection = db.collection('comments');
const playlistsCollection = db.collection('playlists');

export {
  auth,
  db,
  usersCollection,
  songsCollection,
  commentsCollection,
  playlistsCollection,
  storage,
};
