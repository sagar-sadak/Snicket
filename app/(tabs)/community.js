import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { FIRESTORE_DB, auth } from '../../firebaseConfig';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Card, Avatar, IconButton } from 'react-native-paper';
import { logEvent, EVENTS } from '../../analytics';

export default function SocialFeedScreen() {
  const groups = ['General', 'Fiction', 'Non-Fiction', 'Academic'];
  const [selectedGroup, setSelectedGroup] = useState('General');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [userDisplayName, setUserDisplayName] = useState('')
  const filteredPosts = posts.filter(post => post.group === selectedGroup);


  const getPosts = async () => {
    try {
      // logEvent(EVENTS.VIEWCOMM)
      const snapshot = await getDocs(collection(FIRESTORE_DB, 'community'));
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(documents);
    } catch (error) {
      console.error('Error fetching documents: ', error);
      return [];
    }
  };

  const handlePost = () => {
    if (postText.trim().length > 0) {
        const newPost = { id: Date.now().toString(), group: selectedGroup, name: userDisplayName, avatar: 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png', time: new Date().toLocaleString(), text: postText, likes: 0, dislikes: 0 };
        setPosts([newPost, ...posts]);
        setPostText('');
        addDoc(collection(FIRESTORE_DB, 'community'), newPost);
    }
    logEvent(EVENTS.POSTING)
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
      logEvent(EVENTS.POSTENGAGE)
      return post;
    
    }));
  };

  useEffect(() => {

    logEvent(EVENTS.VIEWCOMM)
    getPosts();
    setUserDisplayName(auth.currentUser.displayName)
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
        <View style={styles.groupContainer}>
          {groups.map(group => (
            <TouchableOpacity key={group} onPress={() => setSelectedGroup(group)} style={[styles.groupButton, selectedGroup === group && styles.groupButtonActive]}>
              <Text style={[styles.groupButtonText, selectedGroup === group && styles.groupButtonTextActive]}>{group}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
        <Text style={styles.subTitle}>{selectedGroup} Feed</Text>
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title
                    title={item.name ? item.name : 'Anonymous'}
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
  groupScroll: {
    margin: 10,
  },
  groupContainer: {
    flexDirection: 'row',
  },
  groupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 8,
  },
  groupButtonActive: {
    backgroundColor: '#007bff',
  },
  groupButtonText: {
    color: '#333',
    fontSize: 14,
  },
  groupButtonTextActive: {
    color: '#fff',
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
    margin: 5,
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