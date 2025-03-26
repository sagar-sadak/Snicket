import { React, useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from 'expo-router';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from './styles/MessageStyles';
import { logEvent, EVENTS, setUser} from '../analytics';

const MessagesScreen = ({ navigation }) => {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = FIRESTORE_DB;

  const [conversations, setConversations] = useState([]);

  const getConversations = async () => {

    try {
      const conversationRef = collection(db, "UserConversations");
      const q = query(conversationRef, where("members", "array-contains", user.uid.toString()));

      const snapshot = await getDocs(q);
      const userConversations = snapshot.docs.map(doc => ({ ...doc.data() }));

      // console.log(userConversations)

      const conversationsWithNames = await Promise.all(userConversations.map(async (conversation) => {
        const first_user_name = await getNameFromUid(conversation.first_user);
        const second_user_name = await getNameFromUid(conversation.second_user);
        return {
          ...conversation,
          second_user_name: second_user_name,
          first_user_name: first_user_name,
        };
      }));

      console.log(conversationsWithNames)


      console.log(conversationsWithNames[0].chat_id);
      setConversations(conversationsWithNames);
    } catch (error) {
      console.error('Error fetching documents: ', error);
      return [];
    }
  };

  const getNameFromUid = async (uid) => {
    try {
      const userDocRef = doc(db, 'profile', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().userName !== undefined) {
        return userDoc.data().userName;
      } else {
        console.log('No user found with this UID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  useEffect(() => {
    setUser(user.uid)
    logEvent(EVENTS.VIEW_MESSAGE_SCREEN, { userId: user.uid });
    
    getConversations();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.chat_id}
        renderItem={({ item }) => (
          <Card onPress={() => router.push({ pathname: "/ChatScreen", params: { chat_id: item.chat_id, second_user: item.first_user === user.uid.toString() ? item.second_user : item.first_user } })}>
            <UserInfo>
              <TextSection>
                <UserInfoText>
                  {/* <UserName>{item.first_user === user.uid.toString() ? item.second_user_email : item.first_user_email}</UserName> */}
                  <UserName>{item.first_user === user.uid.toString() ? item.second_user_name || item.second_user_email : item.first_user_name || item.first_user_email}</UserName>
                  {/* <PostTime>{item.messageTime}</PostTime> */}
                </UserInfoText>
                {/* <MessageText>{item.messageText}</MessageText> */}
              </TextSection>
            </UserInfo>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});