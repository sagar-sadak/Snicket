import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import app from '../firebaseConfig';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { logEvent, EVENTS } from '../analytics';

function Login() {
  const router = useRouter();
  const [message, setMessage] = useState('Snicket');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(app);

  const handleSignUp = async () => {
    try {
      
      await createUserWithEmailAndPassword(auth, username, password);
      logEvent(EVENTS.SIGNUP)
      router.replace("(tabs)/home");
      
    } catch (error) {
      console.log(error);
      setMessage("Invalid Credentials");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      logEvent(EVENTS.LOGIN)
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

      <View style={styles.button}>
        <TouchableOpacity
          onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.button}>
        <TouchableOpacity
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
  button: {
    backgroundColor: '#1A73E8',
    width: '100%',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
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