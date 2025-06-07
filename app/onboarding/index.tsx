import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Sparkles, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingIndex() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#0284C7', '#0369A1']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Droplets size={48} color="#ffffff" strokeWidth={2} />
            </View>
            <Text style={styles.appName}>HydroSnap</Text>
            <Text style={styles.tagline}>AI-Powered Hydration</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Sparkles size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.featureText}>Personalized AI assistant</Text>
            </View>
            
            <View style={styles.feature}>
              <TrendingUp size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.featureText}>Track mood & energy levels</Text>
            </View>
            
            <View style={styles.feature}>
              <Droplets size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.featureText}>Smart hydration reminders</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>
              Transform your hydration habits with AI-powered insights
            </Text>
            
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => router.push('/onboarding/quiz')}
            >
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>
              Personalized plan in under 60 seconds
            </Text>
          </View>

        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresSection: {
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  featureText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 16,
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0EA5E9',
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});