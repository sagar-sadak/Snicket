import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth";

const books = [
  { id: '1', title: 'Book 1', user: 'Sarika'},
  { id: '2', title: 'Book 2', user: 'Nitin' },
  { id: '3', title: 'Book 3', user: 'Sagar'},
];


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

  const handleBookPress = (book) => {
    Alert.alert(
      book.title,
      "Choose an option:",
      [
        {text: "Borrow", onPress: () => console.log("Borrowing ", book.title)},
        {text: "Exchange", onPress: () => console.log("Exchanging ", book.title)},
        {text: "Cancel", style: "cancel"}
      ]
    )

  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={exit}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Books Available for Listing</Text>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style = {styles.bookItem} onPress={() => handleBookPress(item)}>
            <View style={styles.bookItem}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookUser}>Listed by {item.user}</Text>
            </View>
          </View>
          </TouchableOpacity>
          
        )}
      />

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
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookItem: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookUser: {
    fontSize: 14,
    color: '#666',
  },
});