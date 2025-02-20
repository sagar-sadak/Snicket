import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import React, {useState} from 'react' 
import {FIRESTORE_DB} from '../../firebaseConfig'
import { addDoc, collection } from 'firebase/firestore';

export default function TodoScreen() {

  const[todo, setTodo] = useState("")
  const[todoList, setTodoList] = useState([])

  const dummyData = [
    {
      id: "01",
      title: "Wash Car"
    }, 
    {
      id: "02",
      title: "Read a Book"
    }
  ];

  const renderTodos = ({item, index}) => {
    return(
      <View 
        style={{
          backgroundColor: "1e90ff",
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 12,
          marginbottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}>
        <Text style={{flex:1}}>{item.title}</Text>

        <IconButton icon="pencil" iconColor="#000" />
        <IconButton icon="trash-can" iconColor="#000" />
      </View>
    );
  };

  const handleAddTodo = () => {

    setTodoList([...todoList, {id: Date.now().toString(), title: todo}]);
    const doc = addDoc(collection(FIRESTORE_DB, 'default'), {id: Date.now().toString(), title: todo});
    setTodo("");

  }


  return (
    <View style={{paddingVertical: 16, paddingHorizontal: 16, flex:1}}>
        <View style={{borderColor: '#1e90ff', borderWidth: 2}}>
          <TextInput
            style  = {{
              borderwidth: 2,
              borderColor: '#1e90ff',
              borderRadium: 6,
              paddingVertical: 16,
              paddingHorizontal: 16
            }}
            placeholder="Add a task"
            value={todo}
            onChangeText={(userText)=> setTodo(userText)}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleAddTodo}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>

        {/* Render todo list */}

        <FlatList data={todoList} renderItem={renderTodos} />    

    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 24,
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
  }
});