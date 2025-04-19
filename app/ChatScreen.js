import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDocs, query, where, orderBy, Firestore } from "firebase/firestore";
import { FIRESTORE_DB } from '../firebaseConfig';
import { getAuth } from "firebase/auth";
// import uuid from 'react-native-uuid';
import { v4 as uuidv4 } from 'uuid';
import { logEvent, EVENTS, setUser } from '../analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState("A");
  const router_param = useLocalSearchParams();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = FIRESTORE_DB;
  const router = useRouter();
  
  const navigateToProfile = (uid) => {
    logEvent(EVENTS.VIEW_OTHER_PROFILE);
    router.push(`/user/${uid}`);
  };

  const setUserGroup = async () => {
    const value = await AsyncStorage.getItem('userGroup');
    setGroup(value);
  };

  const getMessages = async () => {
    try {
      console.log(getCurrentLocale())

      const messageRef = collection(db, "UserConversations", router_param.chat_id, "messages");
      const q = query(messageRef, orderBy("message.createdAt", "desc"));

      const snapshot = await getDocs(q);
      const userMessages = snapshot.docs.map((doc) => {
        // console.log(doc.data())
        const firebaseData = doc.data();
        firebaseData.message.user._id = firebaseData.sender === user.uid.toString() ? 1 : 2;
        return {
          _id: uuidv4(),
          text: firebaseData.message.text,
          createdAt: firebaseData.message.createdAt.toDate(),
          user: firebaseData.message.user
        };
      });

      setMessages(userMessages);

      console.log(userMessages)

    } catch (error) {
      console.error('Error fetching documents: ', error);
      return [];
    }
  }

  useEffect(() => {
      setUserGroup();
    }, []);

  useEffect(() => {

    setUser(user.uid);
    logEvent(EVENTS.VIEW_CHAT_SCREEN, { userId: user.uid });

    // console.log(this.context.getLocale())

    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    //   {
    //     _id: 2,
    //     text: 'Hello world',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 1,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    // ]);

    // console.log(converstation);

    const messageRef = collection(db, "UserConversations", router_param.chat_id, "messages");
    const q = query(messageRef, orderBy("message.createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const userMessages = snapshot.docs.map((doc) => {
        // console.log(doc.data())
        const firebaseData = doc.data();
        firebaseData.message.user._id = firebaseData.sender === user.uid.toString() ? 1 : 2;
        return {
          _id: uuidv4(),
          text: firebaseData.message.text,
          createdAt: firebaseData.message.createdAt.toDate(),
          user: firebaseData.message.user
        };
      });

      setMessages(userMessages);
    });

    return () => unsubscribe();

  }, [router_param.chat_id]);


  const onSend = useCallback(async (messages = []) => {
    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, messages),
    // );


    try {
      const messageRef = collection(db, 'UserConversations', router_param.chat_id, 'messages');

      let new_message = {
        sender: user.uid.toString(),
        receiver: router_param.second_user,
        message: messages[0]
      }

      await addDoc(messageRef, new_message);

      setUser(user.uid)
      logEvent(EVENTS.MESSAGE_SENT, { userId: user.uid })
      console.log("Message Saved to DB")
    }
    catch (error) {
      console.error(error);
    }

  }, []);

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{ marginBottom: 5, marginRight: 5 }}
            size={32}
            color="#2e64e5"
          />
        </View>
      </Send>
    );
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2e64e5',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return (
      <FontAwesome name='angle-double-down' size={22} color='#333' />
    );
  }

  return (

    <View style={{ flex: 1 }}>
      {group == "B" && (
        <TouchableOpacity style={styles.profileButton} onPress={() => navigateToProfile(router_param.second_user)}>
          <Text style={styles.profileButtonText}>Visit This User's Profile</Text>
        </TouchableOpacity>
      )}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: '#2e64e5',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});