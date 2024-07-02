import firebase from 'firebase/compat/app';
import 'firebase/compat/database'; // 

const firebaseConfig = {
    apiKey: "AIzaSyCXy9jo1Vd1ioexwWl5JvGPvaQZzc9LhO0",
    authDomain: "subasthika-motors.firebaseapp.com",
    databaseURL: "https://subasthika-motors-default-rtdb.firebaseio.com",
    projectId: "subasthika-motors",
    storageBucket: "subasthika-motors.appspot.com",
    messagingSenderId: "433799545861",
    appId: "1:433799545861:web:538adc5abb89e609f0486c"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
