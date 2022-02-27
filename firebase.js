// Import the functions you need from the SDKs you need
import * as store from "firebase/firestore"
import {initializeApp, getApps, getApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBywOXrN9Plg89AAagBA7BQjoYbjf8vAL0",
  authDomain: "chatapp-9d117.firebaseapp.com",
  projectId: "chatapp-9d117",
  storageBucket: "chatapp-9d117.appspot.com",
  messagingSenderId: "30198813594",
  appId: "1:30198813594:web:23e17ee75fc3f5e0bca023"
};

let app
if(getApps().length === 0)
{
    app = initializeApp(firebaseConfig);
}
else
{
    app = getApp();
}

const auth  = getAuth();
const db = getFirestore();

export {auth,db,store};
