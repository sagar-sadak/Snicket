import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, addDoc, onSnapshot} from "firebase/firestore";

export default function HomeScreen() {
  const auth = getAuth();

  const db = FIRESTORE_DB;
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [books, setBooks] = useState([]);

  useEffect( () => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      const bookList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setBooks(bookList);
    });
    return () => unsubscribe();
  }, []);

  const handleBookPress = (book) => {
    Alert.alert(
      book.title,
      "Choose an option:",
      [
        {text: "Borrow", onPress: () => Alert.alert("Borrow request sent!")},
        {text: "Exchange", onPress: () => Alert.alert("Exchange request sent!")},
        {text: "Cancel", style: "cancel"}
      ]
    );
  };

  const handleCreateListing = () => {
    Alert.alert(
      "Create a Listing",
      " ",
      [
        {text: "Add book by ISBN", onPress: () => Alert.alert("Functionality coming soon.")},
        {text: "Add book by Title and Author", onPress: () => setModalVisible(true)},
        {text: "Cancel", style: "cancel"}
      ]
    );
  };

  const addBookToFirestore = async () => {
    if (!title || !author){
      Alert.alert("Error", "Please enter both title and author.");
      return; 
    }
    try {
      await addDoc(collection(db, "listings"), {
        title, 
        author, 
        listedBy: user?.uid,
        listedByEmail: user?.email || "Unknown",
        timestamp: new Date(),

      });
      Alert.alert("Success,", "Book Listed");
      setTitle('');
      setAuthor('');
      setModalVisible(false);
    } catch (error){
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Failed to add book");

    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Books Available for Listing</Text>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle = {styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style = {styles.bookCard} onPress={() => handleBookPress(item)}>
            <View>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style ={styles.bookUser}>{item.author}</Text>
              <Text style={styles.bookUser}>Listed by {item.listedByEmail}</Text>
            </View>
          </View>
          </TouchableOpacity>
          
        )}
      />

      <TouchableOpacity style = {styles.button} onPress={handleCreateListing}>
        <Text style = {styles.buttonText}>Create a Listing</Text>
      </TouchableOpacity>

      <Modal visible = {modalVisible} animationType='slide' transparent>
        <View style = {styles.modalContainer}>
          <View style = {styles.modalContent}>
            <Text style = {styles.modalTitle}>Type Book Title and Author</Text>
            <TextInput
            style = {styles.input}
            placeholder='Book Title'
            value={title}
            onChangeText={setTitle}
            />
            <TextInput
            style = {styles.input}
            placeholder='Author'
            value= {author}
            onChangeText={setAuthor}
            />
            <TouchableOpacity style= {styles.modalButton} onPress={addBookToFirestore}>
            <Text style= {styles.modalButtonText}>Add Listing</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.modalButton} onPress={()=> setModalVisible(false)}>
            <Text style= {styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>            
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
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
  row: {
    justifyContent: 'space-between',
  },
  bookCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    width: '48%',
    alignItems: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookInfo: {
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookUser: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});