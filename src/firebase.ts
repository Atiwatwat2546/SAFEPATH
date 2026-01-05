import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxYXdKV0jUdMq3uYTB5fh2XqHmt4A_SVo",
  authDomain: "testexpo-90dd3.firebaseapp.com",
  projectId: "testexpo-90dd3",
  storageBucket: "testexpo-90dd3.firebasestorage.app",
  messagingSenderId: "284694259994",
  appId: "1:284694259994:web:c7b920d62c88a94e0024a3",
  measurementId: "G-V1L6WKKBJF"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db, firebase };