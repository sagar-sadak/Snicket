import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
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

const Messages = [
  {
    id: '1',
    userName: 'Sarika Singh',
    messageTime: '4 mins ago',
    messageText:
      'Hey there, I am looking to exchange some books.',
  },
  {
    id: '2',
    userName: 'Sagar Sadak',
    messageTime: '2 hours ago',
    messageText:
      'Hey there, I am looking to exchange some books.',
  },
  {
    id: '3',
    userName: 'Aditi Agarwal',
    messageTime: '1 hours ago',
    messageText:
      'Hey there, I am looking to exchange some books.',
  },
  {
    id: '4',
    userName: 'Nitin Chawla',
    messageTime: '1 day ago',
    messageText:
      'Hey there, I am looking to exchange some books.',
  },
  {
    id: '5',
    userName: 'Guangaya Singh Mamak',
    messageTime: '2 days ago',
    messageText:
      'Hey there, I am looking to exchange some books.',
  },
];

const MessagesScreen = ({navigation}) => {
  const router = useRouter();
    return (
      <Container>
        <FlatList 
          data={Messages}
          keyExtractor={item=>item.id}
          renderItem={({item}) => (
            <Card onPress={() => router.push("/ChatScreen")}>
              <UserInfo>
                <TextSection>
                  <UserInfoText>
                    <UserName>{item.userName}</UserName>
                    <PostTime>{item.messageTime}</PostTime>
                  </UserInfoText>
                  <MessageText>{item.messageText}</MessageText>
                </TextSection>
              </UserInfo>
            </Card>
          )}
        />
      </Container>
    );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});