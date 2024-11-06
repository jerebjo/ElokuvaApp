import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoj5NKtoOmbkuaRr1c7MSErMWrwa_QbAk",
  authDomain: "elokuvapp.firebaseapp.com",
  projectId: "elokuvapp",
  storageBucket: "elokuvapp.appspot.com",
  messagingSenderId: "845216449116",
  appId: "1:845216449116:web:4322c0ecfdb1ba628c1c99"
};

// Initialize Firebase
 const FIREBASE_APP = initializeApp(firebaseConfig);
 const FIREBASE_AUTH = getAuth(FIREBASE_APP);

 export {FIREBASE_AUTH}
