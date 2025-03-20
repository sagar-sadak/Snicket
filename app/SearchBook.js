import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Image, StyleSheet, ScrollView } from 'react-native';


const SearchBook = ({onSelectBook}) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const fetchBookFromAPI = async (searchQuery) => {
        if (searchQuery.trim() ===''){
            setSearchResults([]);
            return;
        }
        const baseUrl = `https://openlibrary.org/search.json`;

        const url = `${baseUrl}?title=${encodeURIComponent(searchQuery)}&author=${encodeURIComponent(searchQuery)}&limit=10`;

        try {
            const response = await fetch(url);
            
            
            const data = await response.json();
            

            if (data.docs && data.docs.length > 0){
                const books = data.docs.slice(0,10).map(book => ({
                    title: book.title,
                    author: book.author_name ? book.author_name.join(',') : "Unknown",
                    coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,

                }));
                setSearchResults(books);
            } else{
                setSearchResults([]);
            }

        } catch (error){
            console.error(error);
            // Alert.alert("Error", "Failed to fetch book data");

        }
    };

    useEffect( () => {
        const timeoutId = setTimeout( () => {
            if (query.length > 2){
                fetchBookFromAPI(query);
            } else {
                setSearchResults([]);
            }            
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <View>
            <TextInput
            style = {{ padding: 10, borderWidth: 1, marginBottom: 10 }}
            placeholder="Type book title or author..."
            value= {query}
            onChangeText={setQuery}
            />

            {searchResults.length>0 && (
                <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity onPress={() => onSelectBook(item)} style = {styles.listItem}>
                        <Image source={{uri: item.coverUrl}} style={styles.coverImage}/>
                        <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.author}>{item.author}</Text>
                        </View>
                        
                    </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }} />
                
            )}            
        </View>
        
    );
};
const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        alignItems: 'center', // Align image and text horizontally
      },
      coverImage: {
        width: 60, // Smaller image size
        height: 90,
        marginRight: 10, // Space between image and text
        resizeMode: 'contain',
      },
      title: {
        fontWeight: 'bold',
        fontSize: 16,
      },
      author: {
        fontSize: 14,
        color: 'gray',
      },
      textContainer: {
        flex: 1, // Ensure text container takes up remaining space
      },
      container: {
        padding: 10,
      },

})
export default SearchBook;



    