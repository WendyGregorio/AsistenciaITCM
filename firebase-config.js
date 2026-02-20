// firebase-config.js
// Ve a https://console.firebase.google.com/ -> Tu Proyecto -> Configuración del proyecto -> General -> SDK Setup -> CDN
// No imports needed with script tags in HTML
const firebaseConfig = {
    apiKey: "AIzaSyCzaTDU8KMbZNQICU5HnezQ0CdzkCbeWYQ",
    authDomain: "asistencia-itcm.firebaseapp.com",
    projectId: "asistencia-itcm",
    storageBucket: "asistencia-itcm.firebasestorage.app",
    messagingSenderId: "797714026329",
    appId: "1:797714026329:web:ec923565f5ef35cb160648"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Configuración correcta
console.log("Firebase configurado");

