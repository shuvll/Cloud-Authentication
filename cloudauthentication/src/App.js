// Importing everything from react app and firebase.
import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Linking my firebase that I created.
firebase.initializeApp({
  apiKey: "AIzaSyDIbrJnkre_UiOaNTlz7CPKQSTP-yWZtUk",
  authDomain: "cloud-authentication-7921c.firebaseapp.com",
  projectId: "cloud-authentication-7921c",
  storageBucket: "cloud-authentication-7921c.appspot.com",
  messagingSenderId: "577813332377",
  appId: "1:577813332377:web:1e0c7b863c8119bd979308",
  measurementId: "G-4Y9Z7ZB18E"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

// Start of the app, displaying either the chat room or the sign in button. It will show the sign in button if the user is not signed in, otherwise, it will show the chatroom.
function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>🙂🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

// Handles sign in with the google authentication with Firebase. Sends a message about the guidelines of the chat.
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines. Failure to do so will result in a ban.</p>
    </>
  )

}


// Handles sign out if the user clicks on sign out.
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

// Handles the interactions with the chatroom, including autoscrolling when a message is sent.
function ChatRoom() {
  const scroll = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    scroll.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={scroll}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>📄📨</button>

    </form>
  </>)
}

// Describes if a message has been sent.
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;