import React, { useState } from 'react';
import { View, SafeAreaView, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { FIRESTORE_DB } from '../../firebaseConfig'
import { addDoc, collection } from 'firebase/firestore';
import { Card, Avatar, IconButton } from 'react-native-paper';

export default function SocialFeedScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    { id: '1', name: 'John Doe', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: '2h ago', text: 'This is my second post.', likes: 12, dislikes: 1 },
    { id: '2', name: 'Jane Smith', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: '3h ago', text: 'This is my first post.', likes: 30, dislikes: 2 }
  ]);

  const handlePost = () => {
    if (postText.trim().length > 0) {
        setPosts([{ id: Date.now().toString(), name: 'New User', avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: 'Just now', text: postText, likes: 0, dislikes: 0 }, ...posts]);      setPostText('');
    //   const doc = addDoc(collection(FIRESTORE_DB, 'default'), {id: Date.now().toString(), title: postText});
    }
  };

  const handleLike = (id) => {
    setPosts(posts.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };

  const handleDislike = (id) => {
    setPosts(posts.map(post => post.id === id ? { ...post, dislikes: post.dislikes + 1 } : post));
  };

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
          <TouchableOpacity style={styles.button} onPress={handlePost}>
                <Text style={styles.buttonText}>Create Post</Text>
            </TouchableOpacity>
        </View>
        
          <Text style={styles.subTitle}>Recent Posts</Text>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title
                    title={item.name}
                    subtitle={item.time}
                    left={(props) => <Avatar.Image {...props} source={{ uri: item.avatar }} size={40} />}
                  />
                  <Card.Content>
                    <Text style={styles.postText}>{item.text}</Text>
                  </Card.Content>
                  <Card.Actions style={styles.actionsContainer}>
                    <View style={styles.actionsRow}>
                      <IconButton icon="thumb-up" size={16} onPress={() => handleLike(item.id)} />
                      <Text>{item.likes}</Text>
                      <IconButton icon="thumb-down" size={16} onPress={() => handleDislike(item.id)} />
                      <Text>{item.dislikes}</Text>
                    </View>
                  </Card.Actions>
                </Card>
            )}
          />
      </KeyboardAvoidingView>
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
    justifyContent: 'flex-start',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  flexContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 12,
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postText: {
    fontSize: 16,
    color: '#333',
  }
});