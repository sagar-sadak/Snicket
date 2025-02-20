import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  const getWeatherData = () => {
    setLoading(true);
    const api = process.env.EXPO_PUBLIC_API_KEY;
    if (errorMsg) {
      Alert.alert(errorMsg);
    } else if (location) {
      fetch(`http://api.weatherapi.com/v1/current.json?key=${api}&q=${location.coords.latitude},${location.coords.longitude}`)
      .then(response => response.json())
      .then(data => {
        setWeatherData(data);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
    }
    setLoading(false);
  };

  const renderWeather = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
    if (!weatherData) {
      return <Text style={styles.errorText}></Text>;
    }
    const now = new Date();

    // Get hours, minutes, and seconds
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const { name, region } = weatherData.location;
    const { temp_f, condition } = weatherData.current;

    return (
      <View style={styles.weatherContainer}>
        <View style={styles.body}>
          <Image source={{ uri: `https:${condition.icon}` }} style={styles.weatherIcon} />
          <Text style={styles.temperatureText}>{`${temp_f}°F`}</Text>
          <Text style={styles.conditionText}>{condition.text}</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.locationText}>{`${name}, ${region}`}</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.lastUpdateText}>Weather last updated at {`${hours}:${minutes}:${seconds}`}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.weatherCard}>
      {renderWeather()}
      </View>
      <TouchableOpacity style={styles.button} onPress={getWeatherData}>
        <Text style={styles.buttonText}>Get Weather</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    weatherContainer: {
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
    weatherCard: {
      marginBottom: 20,
    },
    header: {
      marginTop: 10,
    },
    locationText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
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
    weatherIcon: {
      width: 80,
      height: 80,
      marginBottom: 10,
    },
    temperatureText: {
      color: '#fff',
      fontSize: 48,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    conditionText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '300',
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