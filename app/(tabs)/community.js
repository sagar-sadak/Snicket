import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { FIRESTORE_DB, auth } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Card, Avatar, IconButton, Divider, TextInput as RNTextInput, Button } from 'react-native-paper';
import { logEvent, EVENTS } from '../../analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import PremiumPrompt from '.././PremiumPrompt';

export default function SocialFeedScreen() {
  const groups = ['+', 'General', 'Fiction', 'Non-Fiction', 'Academic'];
  const [selectedGroup, setSelectedGroup] = useState('General');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [userDisplayName, setUserDisplayName] = useState('');
  const filteredPosts = posts.filter(post => post.group === selectedGroup);
  const [comment, setComment] = useState("");
  const [group, setGroup] = useState("A");
  const [showPrompt, setShowPrompt] = useState(false);

  const router = useRouter();

  const getPosts = async () => {
    try {
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
      const currID = Date.now().toString();
      const newPost = { id: currID, group: selectedGroup, name: userDisplayName, time: new Date().toLocaleString(), text: postText.trim(), likes: 0, dislikes: 0, userReaction: null, comments: [], showComments: false, uid: auth.currentUser.uid };
      setPosts([newPost, ...posts]);
      setPostText('');
      const docRef = doc(FIRESTORE_DB, 'community', currID);
      setDoc(docRef, newPost, { merge: true });
      logEvent(EVENTS.POSTING);
    }
  };

  const handleReaction = (id, type) => {
    logEvent(EVENTS.POSTENGAGE)
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

  const toggleComments = (id) => {
    setPosts(posts.map(post => post.id === id ? { ...post, showComments: !post.showComments } : post));
  };

  const addComment = async (postId) => {
    if (comment.trim().length === 0) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newPost = {
          ...post,
          comments: [...post.comments, { commentID: Date.now().toString(), name: userDisplayName, text: comment }]
        };
        const docRef = doc(FIRESTORE_DB, 'community', postId);
        setDoc(docRef, newPost, { merge: true });
        return newPost;
      }
      return post;
    }));
    setComment("");
  };

  const setUserGroup = async () => {
    const value = await AsyncStorage.getItem('userGroup');
    setGroup(value);
  };

  const navigateToProfile = (uid) => {
    logEvent(EVENTS.VIEW_OTHER_PROFILE);
    router.push(`/user/${uid}`);
  };

  const groupSelect = (group) => {
    if (group != "+") {
      setSelectedGroup(group);
    }
    else {
      setShowPrompt(true);
    }
  };

  useEffect(() => {
    logEvent(EVENTS.VIEWCOMM);
    setUserGroup();
    getPosts();
    setUserDisplayName(auth.currentUser.displayName);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
          <View style={styles.groupContainer}>
            {groups.map(group => (
              <TouchableOpacity key={group} onPress={() => groupSelect(group)} style={[styles.groupButton, selectedGroup === group && styles.groupButtonActive]}>
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
              left={(props) => (
                group === "B" ? (
                  <View>
                    <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
                      <Avatar.Text
                        size={40}
                        label={item.name ? item.name[0] : 'A'}
                        style={styles.commentAvatarClickable}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Avatar.Text
                    size={40}
                    label={item.name ? item.name[0] : 'A'}
                    style={styles.commentAvatar}
                  />
                )
              )}
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
              {group == "B" && (
                <Button style={styles.showCommentButton} icon={'comment'} mode='contained-tonal' onPress={() => toggleComments(item.id)}>
                  <Text style={styles.commentToggle}>
                    {item.showComments ? 'Hide Comments' : 'Show Comments'}
                  </Text>
                </Button>
              )}
            </Card.Actions>
            {item.showComments && group == "B" && (
              <View style={styles.commentSection}>
                <Divider style={styles.divider} />
                <Text style={styles.commentsHeader}>Comments</Text>
                <Divider style={styles.divider} />
                <ScrollView style={{ maxHeight: 200 }}>
                  {item.comments.map(comment => (
                    <View key={comment.commentID} style={styles.commentItem}>
                      <Avatar.Text size={36} label={comment.name ? comment.name[0] : "A"} style={styles.commentAvatar} />
                      <View style={styles.commentContent}>
                        <Text style={styles.commentAuthor}>{comment.name}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.commentInputWrapper}>
                  <RNTextInput
                    placeholder="Write a comment..."
                    style={styles.commentInput}
                    multiline={true}
                    value={comment}
                    onChangeText={(text) => setComment(text)}
                    right={<RNTextInput.Icon icon="send" onPress={() => addComment(item.id)} style={{ alignSelf: 'center' }} />}
                  />
                </View>
              </View>
            )}
          </Card>
        )}
      />
      <PremiumPrompt
        visible={showPrompt}
        onClose={() => {
          setShowPrompt(false)
          router.push({ pathname: "/community" });
        }}
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
    flexDirection: 'column'
  },
  actionsRow: {
    display: 'flex',
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 0
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
    // marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    marginVertical: 8,
  },
  showCommentButton: {
    width: "100%",
  },
  commentSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  commentsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 10,
  },
  commentAvatar: {
    backgroundColor: '#007bff',
    marginRight: 8,
  },
  commentAvatarClickable: {
    margin: 0,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    elevation: 3,
    backgroundColor: '#007bff',
  },
  commentContent: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 13,
  },
  commentText: {
    fontSize: 13,
    color: '#333',
  },
  commentInputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 14,
  },
  viewProfileText: {
    fontSize: 8,
    color: '#3498db',
    textAlign: 'center',
    marginTop: 2,
  }
});