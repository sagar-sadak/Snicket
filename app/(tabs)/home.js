import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { analytics, FIRESTORE_DB } from '../../firebaseConfig';
import {collection, addDoc, onSnapshot, deleteDoc, doc} from "firebase/firestore";
import SearchBook from '../SearchBook';

export default function HomeScreen() {
  const auth = getAuth();

  const db = FIRESTORE_DB;
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect( () => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      const bookList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setBooks(bookList);
    });
    return () => unsubscribe();
  }, []);

  const handleBookPress = (book) => {
    if (book.listedByEmail ===user?.email){
      Alert.alert(
        "Delete this listing?",
        "Are you sure you wanna remove this book?",
        [
          {text: "Yes, Delete", onPress: ()=> deleteListing(book.id)},
          {text: "Cancel", style: "cancel"}
        ]
      );
    } else {
    Alert.alert(
      book.title,
      "Choose an option:",
      [
        {text: "Borrow", onPress: () => Alert.alert("Borrow request sent!")},
        {text: "Exchange", onPress: () => Alert.alert("Exchange request sent!")},
        {text: "Cancel", style: "cancel"}
      ]
    );
  }
  };

  const handleCreateListing = () => {
    setModalVisible(true)

  };

  const addBookToFirestore = async () => {
    if (!selectedBook){
      Alert.alert("Error", "No book selected.");
      return;
    } 
    try {
      await addDoc(collection(db, 'listings'), {
        title: selectedBook.title,
        author: selectedBook.author,
        coverUrl: selectedBook.coverUrl,
        listedByEmail: user?.email || "Unknown",
        listedBy: user?.uid,
        timestamp: new Date(),
      });
      Alert.alert("Success!", "Book Listed");
      setModalVisible(false);
      setSelectedBook(null);
    } catch (error){
      console.error(error);
      Alert.alert("Error", "Failed to add book.");
    }
    

  };
  const deleteListing = async (bookId) => {
    try {
      await deleteDoc(doc(db, "listings", bookId)); 
      Alert.alert("Success!", "Listing deleted.");
    } catch (error) {
      console.error("Error deleting document:", error);
      Alert.alert("Error", "Failed to delete listing.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Books Available for Listing</Text>

      <FlatList
        data={[...books].sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle = {styles.row}
        renderItem={({ item }) => {
          const isUserBook = item.listedByEmail == user?.email; 
          return (
          <TouchableOpacity style = {[styles.bookCard, isUserBook && styles.userBookCard]} onPress={() => handleBookPress(item)}>
            <View>
              {item.coverUrl && <Image source={{uri: item.coverUrl}} style={styles.bookCover} />}
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style ={styles.bookUser}>{item.author}</Text>
              <Text style={styles.bookUser}>{isUserBook ? "Your Listing" : `Listed by: ${item.listedByEmail}`}</Text>
            </View>
          </View>
          </TouchableOpacity>
          
        )}}
      />

      <TouchableOpacity style = {styles.button} onPress={handleCreateListing}>
        <Text style = {styles.buttonText}>Create a Listing</Text>
      </TouchableOpacity>

      <Modal visible = {modalVisible} animationType='slide' transparent>
        <View style = {styles.modalContainer}>
          <View style = {styles.modalContent}>
            <Text style = {styles.modalTitle}>Search for a Book</Text>
            <SearchBook onSelectBook={(book) => setSelectedBook(book)}/>
            {selectedBook && (
              <View style= {styles.bookCard}>
                {selectedBook.coverUrl && <Image source={{ uri: selectedBook.coverUrl }} style={styles.bookCover}/>}
                <Text style={styles.bookTitle}>{selectedBook.title}</Text>
                <Text style={styles.bookUser}>{selectedBook.author}</Text>
                <TouchableOpacity style={styles.modalButton} onPress={addBookToFirestore}>
                <Text style={styles.modalButtonText}>Click to list this book</Text>
                </TouchableOpacity>

              </View>
            )}
            
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
  bookCover: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 8,
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
  },
  userBookCard: {
    backgroundColor: '#d4edda', // Light green background for user's listings
    borderColor: '#155724',
    borderWidth: 1,
  },
  // searchResultContainer: {
  //   marginTop: 10,
  // },
});