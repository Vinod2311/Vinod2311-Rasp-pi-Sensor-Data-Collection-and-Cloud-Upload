
import data from '../readingFirebase.json' with { type: 'json' };
import userData from '../user.json' with { type: 'json' };
import {getStorage,ref as refStorage,uploadBytes}  from 'firebase/storage'
import { initializeApp} from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth"
import { getDatabase, set, get, child, update, ref } from "firebase/database";
import * as fs from 'node:fs'
import path from 'node:path';

//Public API for database
const firebaseConfig = {
  apiKey: "AIzaSyCHfnIcqTbOKuKtizPN4qUp6_AuwABENF8",
  authDomain: "raspberry-pi-plant-monitoring.firebaseapp.com",
  databaseURL: "https://raspberry-pi-plant-monitoring-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "raspberry-pi-plant-monitoring",
  storageBucket: "raspberry-pi-plant-monitoring.appspot.com",
  messagingSenderId: "656085848146",
  appId: "1:656085848146:web:d899dd1a52857536610f8b",
  measurementId: "G-XZ4ZSM1J4X"
};

const currentUser = userData.currentUser

//Initialise firebase instance
var userFirebase
var firebaseApp = initializeApp(firebaseConfig)
const firebaseDatabase = getDatabase(firebaseApp);
const firebaseAuth = getAuth(firebaseApp)




async function createUserFirebase(){
  var emailAlreadyInUse = false
  await createUserWithEmailAndPassword(firebaseAuth, currentUser["email"],currentUser["password"]).then
  ((userCredentials) => {
    userFirebase = userCredentials.user
    console.log(userFirebase)
  })
  .catch((error) => {
    console.log(error.code)
    emailAlreadyInUse = true
  })
  if (emailAlreadyInUse == true){
    await signInUserFirebase()
  }
}

async function signInUserFirebase(){
  await signInWithEmailAndPassword(firebaseAuth,currentUser["email"],currentUser["password"]).then
  ((userCredentials) => {
    userFirebase = userCredentials.user
  }).catch((error) => {
    const errorCode = error.code
    console.log(errorCode)
    return
    
  })
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadDataFirebase(){
  try {
    await createUserFirebase()
    //await uploadImage()
    const firebaseData = {
      ...data,
      timestamp: Date.now(),
      ownerName: currentUser["fName"] + " " + currentUser["lName"],
    }
    const userData = {fName: currentUser["fName"], lName: currentUser["lName"], email: currentUser["email"]}
    await update(ref(firebaseDatabase,'users/' + userFirebase.uid +'/'  ),userData)
    const result = await set(ref(firebaseDatabase,'users/' + userFirebase.uid + '/' + currentUser.raspberryPiName + '/reading'  ),firebaseData)
    const dbRef = ref(firebaseDatabase);
    await get(child(dbRef, `users/${userFirebase.uid}/${currentUser.raspberryPiName}/config`)).then(async (snapshot) => {
    if (snapshot.exists()) {
      await sleep(snapshot.val().firebaseDBFrequency*1000)
    } else {
      console.log("No data available");
    }
    }).catch((error) => {
      console.error(error);
    });
  } catch(error){
    console.error(error)
  } finally {
    console.log("exit")
    
  }
  process.exit()
};

uploadDataFirebase()





