import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, FlatList, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FIRESTORE_DB, auth } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { Avatar, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import startChat from '../(tabs)/home'

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const userId = id;
  const loggedUser = auth.currentUser
    const router = useRouter();
  

  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library');
  const [userEmail, setUserEmail] = useState("Email not found");


  const startChat = async () => {

    console.log("Starting chat with user: ", userId);
    logEvent(EVENTS.CHAT_INITIATED)

    try {
      let doc_name = "";
      if (loggedUser.uid.toString() < userId) {
        doc_name = loggedUser.uid.toString() + "_" + userId;
      } else {
        doc_name = userId + "_" + loggedUser.uid.toString();
      }

      const UserConversationsRef = doc(FIRESTORE_DB, 'UserConversations', doc_name);
      await setDoc(UserConversationsRef, {
        chat_id: doc_name,
        members: [loggedUser.uid.toString(), userId],
        first_user: loggedUser.uid.toString(),
        first_user_email: loggedUser.email.toString(),
        second_user: userId,
        second_user_email: userEmail
      },
        { merge: true });
    }
    catch (error) {
      console.error(error);
      alert("Error", "Failed to Start Chat")
    }

    router.push("/MessageScreen")

  }

  // Function to fetch a user's book listings
  const fetchUserListedBooks = async (userId) => {

    try {
      const allListings = [];

      // First, get all books collections
      const booksCollectionRef = collection(FIRESTORE_DB, 'books');
      const booksSnapshot = await getDocs(booksCollectionRef);

      // For each book, check its listings
      const fetchPromises = booksSnapshot.docs.map(async (bookDoc) => {
        const bookName = bookDoc.id;
        // console.log("cover-", bookDoc.data().coverUrl)
        const listingsCollectionRef = collection(FIRESTORE_DB, `books/${bookName}/listings`);

        // Query listings where the lister is the user we're looking for
        const listingsQuery = query(
          listingsCollectionRef,
          where('listedBy', '==', userId)
        );

        const listingsSnapshot = await getDocs(listingsQuery);

        // Add all matching listings to our array with book information
        listingsSnapshot.docs.forEach(listingDoc => {
          allListings.push({
            id: listingDoc.id,
            bookName: bookName,
            coverUrl: bookDoc.data().coverUrl,
            ...listingDoc.data()
          });
        });
      });

      // Wait for all queries to complete
      await Promise.all(fetchPromises);
      return allListings;
    } catch (error) {
      console.error('Error fetching user listings:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile data
        const userRef = doc(FIRESTORE_DB, 'profile', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserProfile(userData);

          // Extract library data if it exists
          if (userData.library && Array.isArray(userData.library)) {
            setUserLibrary(userData.library);
          }
        } else {
          // Fallback if no dedicated user profile
          const postsQuery = query(
            collection(FIRESTORE_DB, 'community'),
            where('uid', '==', userId)
          );
          const postsSnap = await getDocs(postsQuery);
          if (!postsSnap.empty) {
            const postData = postsSnap.docs[0].data();
            setUserProfile({
              displayName: postData.name,
            });
          }
        }

        // Fetch user's posts
        const postsQuery = query(
          collection(FIRESTORE_DB, 'community'),
          where('uid', '==', userId)
        );
        const postsSnap = await getDocs(postsQuery);
        const postsData = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserPosts(postsData);

        // Fetch user's book listings
        const userListings = await fetchUserListedBooks(userId);
        setUserListings(userListings);
        
        if (userListings && userListings.length > 0 && userListings[0] && userListings[0].listedByEmail) {
          setUserEmail(userListings[0].listedByEmail)
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  const renderProfileHeader = () => {
    return (
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={80}
          label={userProfile?.displayName || userProfile?.userName ? (userProfile.displayName || userProfile.userName)[0] : 'A'}
          style={styles.avatar}
        />
        <Text style={styles.username}>{userProfile?.displayName || userProfile?.userName || 'Anonymous'}</Text>
        <Text style={styles.bio}>{userProfile?.bio || 'No bio available'}</Text>

        {userId !== loggedUser?.uid && (
        <TouchableOpacity 
          style={styles.chatButton} 
          onPress={startChat}
        >
          <Text style={styles.chatButtonText}>Message</Text>
        </TouchableOpacity>
      )}

      </View>
    );
  };

  const renderTabBar = () => {
    return (
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'library' && styles.activeTab]}
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLibraryTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {userLibrary.length === 0 ? (
          <Text style={styles.noContent}>No books in library</Text>
        ) : (
          <View style={styles.booksGrid}>
            {userLibrary.map((book, index) => (
              <Card key={book.isbn || index} style={styles.bookCard}>
                {book.coverUrl && (
                  <Image
                    source={{ uri: book.coverUrl }}
                    style={styles.bookCover}
                    resizeMode="cover"
                  />
                )}
                <Card.Content>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>
                    {book.authors || book.author || 'Unknown Author'}
                  </Text>
                  {book.isbn && (
                    <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderListingsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {userListings.length === 0 ? (
          <Text style={styles.noContent}>No book listings</Text>
        ) : (
          <View style={styles.booksGrid}>
            {userListings.map((listing, index) => (
              <Card key={listing.id} style={styles.bookCard}>
                <Image
                  source={{ uri: listing.coverUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT58P55blSKZmf2_LdBoU7jETl6OiB2sjYy9A&s' }}
                  style={styles.bookCover}
                  resizeMode="cover"
                />
                <Card.Content>
                  <Text style={styles.bookTitle}>{listing.bookName}</Text>
                  {listing.price && (
                    <Text style={styles.bookPrice}>Price: ${listing.price}</Text>
                  )}
                  {listing.condition && (
                    <Text style={styles.bookCondition}>Condition: {listing.condition}</Text>
                  )}
                  {listing.notes && (
                    <Text style={styles.bookNotes} numberOfLines={2}>
                      {listing.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPostsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {userPosts.length === 0 ? (
          <Text style={styles.noContent}>No posts yet</Text>
        ) : (
          userPosts.map(item => (
            <Card key={item.id} style={styles.postCard}>
              <Card.Content>
                <Text style={styles.postDate}>{item.time}</Text>
                <Text style={styles.postGroup}>Posted in: {item.group}</Text>
                <Text style={styles.postText}>{item.text}</Text>
              </Card.Content>
              <Card.Actions>
                <Text style={styles.postStats}>
                  Likes: {item.likes} | Dislikes: {item.dislikes}
                </Text>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderProfileHeader()}
      {renderTabBar()}

      {activeTab === 'library' && renderLibraryTab()}
      {activeTab === 'listings' && renderListingsTab()}
      {activeTab === 'posts' && renderPostsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatar: {
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  bookCard: {
    width: width / 2 - 24,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  bookCover: {
    height: 180,
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  bookIsbn: {
    fontSize: 12,
    color: '#888',
  },
  bookPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 4,
  },
  bookCondition: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  bookNotes: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  noContent: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 30,
  },
  postCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  postGroup: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  postText: {
    fontSize: 16,
    marginBottom: 8,
  },
  postStats: {
    fontSize: 14,
    color: '#777',
  },
  chatButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
  },
  chatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});