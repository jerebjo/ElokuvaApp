import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase-konfiguraatio, joka sisältää projektisi tiedot
const firebaseConfig = {
  apiKey: "AIzaSyCoj5NKtoOmbkuaRr1c7MSErMWrwa_QbAk",  // API-avain
  authDomain: "elokuvapp.firebaseapp.com",  // Auth-domain
  projectId: "elokuvapp",  // Projektin ID
  storageBucket: "elokuvapp.appspot.com",  // Tallennustilakuorma
  messagingSenderId: "845216449116",  // Lähettäjän ID
  appId: "1:845216449116:web:4322c0ecfdb1ba628c1c99"  // Sovelluksen ID
};

// Firebase-sovelluksen alustaminen
let FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB;

try {
  // Alustetaan Firebase käyttäen annettua konfiguraatiota
  FIREBASE_APP = initializeApp(firebaseConfig);  // Firebase-sovellus
  FIREBASE_AUTH = getAuth(FIREBASE_APP);  // Firebase Authentication
  FIREBASE_DB = getFirestore(FIREBASE_APP);  // Firestore-tietokanta
} catch (error) {
  // Jos Firebase-alustaminen epäonnistuu, virhe lokitetaan konsoliin
  console.error("Virhe Firebasea alustettaessa: ", error);
  // Tässä voidaan lisätä virheenkäsittelylogiikka, kuten näyttövirhesanoma käyttäjälle
}

// Viedään autentikointi ja Firestore-viittaukset, jotta niitä voidaan käyttää muualla sovelluksessa
export { FIREBASE_AUTH, FIREBASE_DB };
