// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMyDpjWTESA6Qn3Waz2Q0o48CHapoq4fU",
  authDomain: "idate-libras.firebaseapp.com",
  projectId: "idate-libras",
  storageBucket: "idate-libras.firebasestorage.app",
  messagingSenderId: "319032257250",
  appId: "1:319032257250:web:bfed84c5acaa095c4c8cbb",
  measurementId: "G-HTELLQ3LJM"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig); // Inicializa o Firebase
export const auth = getAuth(firebaseApp); // Exporta o objeto de autenticação
export default firebaseApp; // Exporta firebaseApp como padrão
