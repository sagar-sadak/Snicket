import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth";

export default function HomeScreen() {
  const router = useRouter();
  const auth = getAuth();
  const exit = () => {
    signOut(auth).then(() => {
      console.log("Logged out");
    }).catch((error) => {
      console.log(error);
    });
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={exit}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  }
});