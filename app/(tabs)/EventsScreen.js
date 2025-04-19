import React, { useState, useCallback } from 'react';
import { View, Button } from 'react-native';
import PremiumPrompt from '.././PremiumPrompt';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';



function EventsScreen() {

  const router = useRouter();

  const [showPrompt, setShowPrompt] = useState(false);

  const handlePremiumFeature = () => {
    const isPremium = false;
    if (!isPremium) {
      setShowPrompt(true);
    } else {
    }
  };

  useFocusEffect(
    useCallback(() => {
      handlePremiumFeature();
    }, [])
  );

  return (
    <View>
      <Button title="Use Premium Feature" onPress={handlePremiumFeature} />
      <PremiumPrompt
        visible={showPrompt}
        onClose={() => {
          setShowPrompt(false)
          router.push({ pathname: "/home" });
        }}
        onSubscribe={() => {
        }}
      />
    </View>
  );
}

export default EventsScreen;