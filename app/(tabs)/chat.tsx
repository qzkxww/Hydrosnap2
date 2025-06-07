import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import RippleChat from '@/components/RippleChat';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatTab() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Trigger animations when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);

      // Start animations with staggered timing
      Animated.parallel([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Slide up
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        // Scale up
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.chatContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <RippleChat
          waterIntake={1200}
          dailyGoal={2500}
          currentMood="medium"
          energyLevel="medium"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatContainer: {
    flex: 1,
  },
});