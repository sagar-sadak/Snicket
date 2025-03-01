import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Modal, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { app, FIRESTORE_DB } from '../../firebaseConfig';
import FloatingButton from '../../components/common/FloatingButton';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


const ProfileScreen = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false);
  const [bookDetailsVisible, setBookDetailsVisible] = useState(false);
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCoverUrl, setBookCoverUrl] = useState("");
  const [books, setBooks] = useState([]);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser) {
        console.log("User detected:", loggedInUser.email);
        setEmail(loggedInUser.email);
        setUser(loggedInUser);
      } else {
        console.log("No user detected");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User set, now fetching books...");
      populateBooks();
    }
  }, [user]);

  const populateBooks = async () => {
    try {
      console.log("Populating books");
      setLoading(true);
      const books = await getBooks();
      setBooks(books);
      setLoading(false);
      console.log("Books -", books);
    } catch (error) {
      console.error("Error populating books:", error);
    }
  };

  const getDocument = async () => {
    try {
      console.log("Getting user document", user)
      const docRef = doc(FIRESTORE_DB, "profile", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return docSnap.data();
      } else {
        console.log("No such document!");
        return {};
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setFetchError(true);
      return {};
    }
  };

  const getBooks = async () => {
    try {
      console.log("getting books");
      const processedItems = [];
      const querySnapshot = await getDocument();
      console.log("qeurysnapshot", querySnapshot)

      if (querySnapshot && Array.isArray(querySnapshot["library"])) {
        querySnapshot["library"].forEach((item) => {
          processedItems.push(item);
        });
      }
      return processedItems;
    } catch (error) {
      console.error("Error fetching data:", error);
      setFetchError(true);
      return [];
    }
  };

  const handleFloatingButtonPress = () => {
    setModalVisible(true);
  };

  const handleSearchSelection = async () => {
    if (!isbn) {
      alert('Please enter a value.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      if (!data[`ISBN:${isbn}`]) {
        setError('Book not found.');
        setBookDetailsVisible(false);
      } else {
        const book = data[`ISBN:${isbn}`];
        setBookTitle(book.title || 'Title not available');
        const authors = book.authors ? book.authors.map(author => author.name).join(', ') : 'Author not available';
        const coverUrl = book.cover ? book.cover.small : 'Cover not available';
        setBookAuthor(authors);
        setBookCoverUrl(coverUrl);
        setBookDetailsVisible(true);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      setError('Something went wrong!');
      setBookDetailsVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSelection = async () => {
    console.log('Add book called for user -', user.uid, "Book info -", isbn, bookAuthor, bookTitle, bookCoverUrl)
    await addBook(user.uid, isbn, bookAuthor, bookTitle, bookCoverUrl);
  }

  const handleCloseModal = () => {
    setBookDetailsVisible(false);
    setError('');
    setIsbn('');
    setModalVisible(false);
  };

  const addBook = async (userId, isbn, authors, title, coverUrl) => {
    try {
      const bookExists = books.some(book => book.isbn === isbn);
      console.log("Exists?", bookExists);

      if (!bookExists) {
        const data = [{ "isbn": isbn, "authors": authors, "title": title, "coverUrl": coverUrl }];
        setBooks((prevBooks) => {
          const updatedBooks = [...prevBooks, ...data];

          const docRef = doc(FIRESTORE_DB, "profile", userId);
          setDoc(docRef, { "library": updatedBooks });

          console.log("Adding book", updatedBooks);
          console.log(`Book added successfully to collection profile`);
          return updatedBooks;
        });
        handleCloseModal();
        alert('Book added successfully!');
      } else {
        handleCloseModal();
        alert('Book already added');
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileArea}>
        <Image
          source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
          style={styles.profileImage}
        />
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.booksArea}>
        <Text style={styles.sectionTitle}>My Books</Text>
        <FlatList
          data={books}
          keyExtractor={(item) => item.isbn}
          renderItem={({ item }) => (
            <View style={styles.bookItemContainer}>
              <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
              <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.authors}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      <FloatingButton onPress={handleFloatingButtonPress} />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Add Book</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Book ISBN"
              onChangeText={isbnInput => setIsbn(isbnInput)}
              value={isbn}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {bookDetailsVisible && (
              <View style={styles.result}>
                <Text style={styles.resultText}>Title: {bookTitle}</Text>
                <Text style={styles.resultText}>Authors: {bookAuthor}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {!bookDetailsVisible && (<TouchableOpacity
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={handleSearchSelection}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? <ActivityIndicator color="white" /> : 'Search'}
                </Text>
              </TouchableOpacity>
              )}

              {bookDetailsVisible && (<TouchableOpacity
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={handleAddSelection}
                disabled={loading} // Disable when loading
              >
                <Text style={styles.buttonText}>
                  {loading ? <ActivityIndicator color="white" /> : 'Add'}
                </Text>
              </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleCloseModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal >
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileArea: {
    alignItems: 'center',
    padding: 20,
  },
  booksArea: {
    flex: 4,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  bookItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 20,
    paddingLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  listContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  flatListContent: {
    paddingBottom: 16,
  },
  bookItemContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    width: '100%',
  },
  bookCover: {
    width: 50,
    height: 75,
    borderRadius: 5,
    marginRight: 16,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;

