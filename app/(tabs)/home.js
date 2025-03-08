import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { analytics, FIRESTORE_DB } from '../../firebaseConfig';
import {collection, addDoc, onSnapshot, deleteDoc, doc} from "firebase/firestore";
import SearchBook from './SearchBook';

export default function HomeScreen() {
  const auth = getAuth();

  const db = FIRESTORE_DB;
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  // const [title, setTitle] = useState('');
  // const [author, setAuthor] = useState('');
  const [books, setBooks] = useState([]);
  // const [searchResults, setSearchResults] = useState([]);
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
    // Alert.alert(
    //   "Create a Listing",
    //   " ",
    //   [
    //     {text: "Add book by ISBN", onPress: () => Alert.alert("Functionality coming soon.")},
    //     {text: "Add book by Title and Author", onPress: () => setModalVisible(true)},
    //     {text: "Cancel", style: "cancel"}
    //   ]
    // );
  };

  // const fetchBookFromAPI = async () => {
    
  //   if (!title) {
  //     Alert.alert("Error", "Please enter both title and author");
  //     return; 
  //   }
  //   // const query = `${title} ${author}`;
  //   const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author_name=${encodeURIComponent(author)}`;

  //   try {
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     console.log('API Query result',data.docs[0])

  //     if (data.docs && data.docs.length >0){
  //       const book = data.docs[0];
  //       const bookDetails = {
  //         title: book.title,
  //         author: book.author_name ? book.author_name.join(", ") : "Unknown",
  //         coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
  //       };
  //       setSearchResults([bookDetails]);
  //     } else {
  //       Alert.alert("No results.", "No books found.");
  //     }

  //   } catch (error){
  //     console.error(error);
  //     Alert.alert("Failed to fetch book data");
  //   }
  // }

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
    
    // if (!title || !author){
      
    //   console.log(author)
    //   Alert.alert("Error", "Please enter both title and author.");
    //   return; 
    // }
    
    // try {
    //   const book = searchResults[0];
    //   await addDoc(collection(db, "listings"), {
    //     title: book.title, 
    //     author: book.author, 
    //     coverUrl: book.coverUrl,
    //     listedBy: user?.uid,
    //     listedByEmail: user?.email || "Unknown",
    //     timestamp: new Date(),

    //   });
    //   Alert.alert("Success,", "Book Listed");
    //   setTitle('');
    //   setAuthor('');
    //   setModalVisible(false);
    //   setSearchResults([]);
    // } catch (error){
    //   console.error("Error adding document: ", error);
    //   Alert.alert("Error", "Failed to add book");

    // }
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
        data={books}
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
            {/* <TextInput
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
            <TouchableOpacity style= {styles.modalButton} onPress={fetchBookFromAPI}>
              <Text style= {styles.modalButtonText}>Search for Book</Text>
            </TouchableOpacity>
            {searchResults.length > 0 && ( 
              <View style={styles.searchResultContainer}>
                {searchResults.map((book,index) => (
                  <View key={index} style={styles.bookCard}>
                    {book.coverUrl && <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />}
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookUser}>{book.author}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={addBookToFirestore}>
                      <Text style = {styles.modalButtonText}>Add Listing</Text>
                    </TouchableOpacity>
                  </View>
                ))}                
              </View>
            )} */}
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