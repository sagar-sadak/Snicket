import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from '../firebaseConfig';
import 'react-native-get-random-values';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import app from '../firebaseConfig';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { logEvent, EVENTS } from '../analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Login() {
  const router = useRouter();
  const [message, setMessage] = useState('Snicket');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(app);
  const group = Math.random() < 0.5 ? "A" : "B";

  const storeData = async () => {
    try {
      await AsyncStorage.setItem('userGroup', group);
    } catch (e) {
      console.log(e);
    }
  };

  const isUserSuspended = async () => {
    const suspendedUsersRef = collection(FIRESTORE_DB, "SuspendedUsers");
    const q = query(suspendedUsersRef, where("username", "==", username));

    const snapshot = await getDocs(q);
    console.log(snapshot.docs.length)
    if (snapshot.docs.length === 0) {
      console.log('No reports found for user:', username);
      return false; // No reports found, user is not suspended
    } else {
      console.log('Reports found for user:', username);
      return true; // User is suspended
    }
    
  }


  const handleSignUp = async () => {

    if(await isUserSuspended(username)) {
      Alert.alert(
        "Account Suspended",
        "Your account has been suspended. Please contact support.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    try {      
      await createUserWithEmailAndPassword(auth, username, password);
      logEvent(EVENTS.SIGNUP);
      await storeData();
      router.replace("(tabs)/home");
      
    } catch (error) {
      console.log(error);
      setMessage("Invalid Credentials");
    }
  };

  const handleLogin = async () => {

    if(await isUserSuspended(username)) {
      Alert.alert(
        "Account Suspended",
        "Your account has been suspended. Please contact support.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, username, password);
      logEvent(EVENTS.LOGIN);
      await storeData();
      // console.log('amplitude login info sent')
      router.replace("(tabs)/home");
    } catch (error) {
      setMessage("Invalid Credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{message}</Text>

      <Ionicons name="lock-closed-outline" size={48} style={{ paddingBottom: 30, color: '#fff' }}></Ionicons>

      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#aaa" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa" />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}
          activeOpacity={0.5}
          onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}
          activeOpacity={0.5}
          onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupLink}>
        <Text style={styles.signupText}>Don't have an account? Enter your username and password and click Sign Up</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: '#444',
    backgroundColor: '#222',
    padding: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 35,
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
    paddingLeft: 10,
    borderRadius: 25,
  },
  icon: {
    marginRight: 15,
  },
  buttonContainer:{
    width: '100%',
    marginTop: 20
  },
  button: {
    width: '100%',
    backgroundColor: '#1A73E8',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center'
  }
});


export default Login;