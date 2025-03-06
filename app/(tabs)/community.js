import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { FIRESTORE_DB } from '../../firebaseConfig'
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Card, Avatar, IconButton } from 'react-native-paper';

export default function SocialFeedScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    { id: '1', name: 'John Doe', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: new Date().toLocaleString(), text: 'I just finished reading "A Series of Unfortunate Events" and it was soooo good!!', likes: 12, dislikes: 1 },
    { id: '2', name: 'Jane Smith', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: new Date().toLocaleString(), text: 'I like books!', likes: 30, dislikes: 2 }
  ]);

  const getPosts = async (collectionName) => {
    try {
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'community'));
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // console.log('Documents:', documents);
      setPosts(documents);
    } catch (error) {
      console.error('Error fetching documents: ', error);
      return [];
    }
  };

  const handlePost = () => {
    if (postText.trim().length > 0) {
        const newPost = { id: Date.now().toString(), name: 'New User', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: new Date().toLocaleString(), text: postText, likes: 0, dislikes: 0 };
        setPosts([newPost, ...posts]);
        setPostText('');
        addDoc(collection(FIRESTORE_DB, 'community'), newPost);
    }
  };

  const handleReaction = (id, type) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        if (post.userReaction === type) {
          return { ...post, userReaction: null, likes: type === 'like' ? post.likes - 1 : post.likes, dislikes: type === 'dislike' ? post.dislikes - 1 : post.dislikes };
        }
        return {
          ...post,
          userReaction: type,
          likes: type === 'like' ? (post.userReaction === 'dislike' ? post.likes + 1 : post.likes + 1) : (post.userReaction === 'like' ? post.likes - 1 : post.likes),
          dislikes: type === 'dislike' ? (post.userReaction === 'like' ? post.dislikes + 1 : post.dislikes + 1) : (post.userReaction === 'dislike' ? post.dislikes - 1 : post.dislikes),
        };
      }
      return post;
    }));
  };

  useEffect(() => {
    getPosts('your_collection_name')
      .then(collectionData => {
        console.log('Collection data:', collectionData);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?..."
            placeholderTextColor={'grey'}
            value={postText}
            onChangeText={setPostText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handlePost}>
            <IconButton icon="send" size={24} iconColor='white' />
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
          <Text style={styles.subTitle}>Feed</Text>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title
                    title={item.name}
                    subtitle={item.time}
                    subtitleStyle={{ fontSize: 12 }}
                    left={(props) => <Avatar.Image {...props} source={{ uri: item.avatar }} size={40} />}
                  />
                  <Card.Content>
                    <Text style={styles.postText}>{item.text}</Text>
                  </Card.Content>
                  <Card.Actions style={styles.actionsContainer}>
                    <View style={styles.actionsRow}>
                      <IconButton icon="thumb-up" size={16} onPress={() => handleReaction(item.id, 'like')} iconColor={item.userReaction === 'like' ? 'steelblue' : 'black'} />
                      <Text>{item.likes}</Text>
                      <IconButton icon="thumb-down" size={16} onPress={() => handleReaction(item.id, 'dislike')} iconColor={item.userReaction === 'dislike' ? 'red' : 'black'} />
                      <Text>{item.dislikes}</Text>
                    </View>
                  </Card.Actions>
                </Card>
            )}
          />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    margin: 16,
  },
  actionsContainer: {
    padding: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  sendButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postText: {
    fontSize: 16,
    color: '#333',
  }
});