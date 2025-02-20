import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, {useState} from 'react' 

export default function CurrencyExchangeScreen() {

    const [exchangeData, setCurrencyData] = useState(null);


    const getExchangeRateData = () => {
        const url = 'https://api.exchangerate-api.com/v4/latest/USD';

        fetch(url)
        .then(response => response.json())
        .then(data => {
            setCurrencyData(data);
        })
        .catch(error => {
            console.error('Error fetching exchange data:', error);
        });
        
    }

    const renderExchangeRateData = () => {
       if(!exchangeData) {
            return <Text>Click Button Below</Text>; 
        }

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        return (
            <View style={styles.forexContainer}>
                <View style={styles.body}>
                    <Text style={styles.forexText}>{`1 USD = ${exchangeData.rates.INR} INR`}</Text>
                </View>
                <View style={styles.header}>
                    <Text style={styles.lastUpdateText}>Rate last updated at {`${hours}:${minutes}:${seconds}`}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.rateCard}>
                  {renderExchangeRateData()}
                  </View>
            <TouchableOpacity style={styles.button} onPress={getExchangeRateData}>
            <Text style={styles.buttonText}>Get Exchange Data</Text>
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    forexContainer: {
      width: '90%',
      maxWidth: 350,
      backgroundColor: '#333',
      padding: 20,
      borderRadius: 20,
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    rateCard: {
      marginBottom: 20,
    },
    header: {
      marginTop: 10,
    },
    lastUpdateText: {
      color: '#fff',
      fontSize: 12,
      textAlign: 'center',
    },
    body: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    forexText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    button: {
      backgroundColor: '#333',
      paddingVertical: 12,
      paddingHorizontal: 24,
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
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
  });