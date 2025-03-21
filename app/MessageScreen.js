import { React, useEffect, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
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

const MessagesScreen = ({navigation}) => {
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

      console.log(userConversations[0].chat_id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error fetching documents: ', error);
      return [];
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

    return (
      <SafeAreaView style={styles.container}>
        <FlatList 
          data={conversations}
          keyExtractor={item=>item.chat_id}
          renderItem={({item}) => (
            <Card onPress={() => router.push({pathname: "/ChatScreen", params: {chat_id: item.chat_id, second_user: item.first_user === user.uid.toString() ? item.second_user : item.first_user}})}>
              <UserInfo>
                <TextSection>
                  <UserInfoText>
                    <UserName>{item.first_user === user.uid.toString() ? item.second_user_email : item.first_user_email}</UserName>
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