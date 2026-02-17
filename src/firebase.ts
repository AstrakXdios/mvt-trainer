// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyBUE7OG6WP-nWkgDotimK-qqzluqC_1r2A",
authDomain: "[mtv-trainer.firebaseapp.com](http://mtv-trainer.firebaseapp.com/)",
projectId: "mtv-trainer",
storageBucket: "mtv-trainer.firebasestorage.app",
messagingSenderId: "933980583951",
appId: "1:933980583951:web:16efef3b54f2f4b4488b7a",
measurementId: "G-3CZRXZ60D3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)