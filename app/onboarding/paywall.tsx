import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Sparkles, ChartBar as BarChart3, Brain, Bell, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const features = [
    {
      icon: <Brain size={20} color="#10b981" strokeWidth={2} />,
      title: "Advanced AI Insights",
      description: "Personalized recommendations based on your unique patterns"
    },
    {
      icon: <BarChart3 size={20} color="#3b82f6" strokeWidth={2} />,
      title: "Unlimited History",
      description: "Access all your historical data and long-term trends"
    },
    {
      icon: <Bell size={20} color="#f59e0b" strokeWidth={2} />,
      title: "Smart Reminders",
      description: "AI-powered notification timing based on your schedule"
    },
    {
      icon: <Sparkles size={20} color="#8b5cf6" strokeWidth={2} />,
      title: "Premium Support",
      description: "Priority customer support and feature requests"
    }
  ];

  const handleSubscribe = () => {
    // Here you would integrate with RevenueCat or native subscription
    router.replace('/(tabs)');
  };

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#0284C7']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Crown size={48} color="#f59e0b" strokeWidth={2} />
          <Text style={styles.headerTitle}>Unlock HydroSnap Premium</Text>
          <Text style={styles.headerSubtitle}>
            Get personalized AI insights and track your complete hydration journey
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        {/* Your Personalized Plan */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Your Personalized Plan</Text>
          <Text style={styles.planDetails}>
            Based on your quiz responses, we recommend <Text style={styles.highlight}>2.8L daily</Text> with 
            reminders every <Text style={styles.highlight}>90 minutes</Text> to boost your energy and focus.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Annual Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'annual' && styles.pricingCardSelected
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.pricingHeader}>
              <View style={styles.pricingLeft}>
                <View style={styles.radioButton}>
                  {selectedPlan === 'annual' && <View style={styles.radioButtonSelected} />}
                </View>
                <View>
                  <Text style={styles.pricingTitle}>Annual Plan</Text>
                  <Text style={styles.pricingSavings}>Save 67% • Most Popular</Text>
                </View>
              </View>
              <View style={styles.pricingRight}>
                <Text style={styles.pricingPrice}>$39.99</Text>
                <Text style={styles.pricingPeriod}>per year</Text>
              </View>
            </View>
            
            <View style={styles.pricingFeatures}>
              <View style={styles.pricingFeature}>
                <Check size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.pricingFeatureText}>3-day free trial</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Check size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.pricingFeatureText}>Just $3.33/month</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardSelected
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.pricingHeader}>
              <View style={styles.pricingLeft}>
                <View style={styles.radioButton}>
                  {selectedPlan === 'monthly' && <View style={styles.radioButtonSelected} />}
                </View>
                <View>
                  <Text style={styles.pricingTitle}>Monthly Plan</Text>
                </View>
              </View>
              <View style={styles.pricingRight}>
                <Text style={styles.pricingPrice}>$10.00</Text>
                <Text style={styles.pricingPeriod}>per month</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
          <Text style={styles.ctaButtonText}>
            Start {selectedPlan === 'annual' ? 'Free Trial' : 'Subscription'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          {selectedPlan === 'annual' 
            ? 'Free for 3 days, then $39.99/year. Cancel anytime.'
            : 'Billed monthly. Cancel anytime.'
          }
        </Text>
        
        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  planCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0369a1',
    marginBottom: 12,
  },
  planDetails: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    lineHeight: 24,
  },
  highlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#0EA5E9',
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  pricingCardSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#f0f9ff',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pricingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0EA5E9',
  },
  pricingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  pricingSavings: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
  },
  pricingRight: {
    alignItems: 'flex-end',
  },
  pricingPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  pricingPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  pricingFeatures: {
    gap: 8,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingFeatureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginLeft: 8,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ctaButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  legalSeparator: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
  },
});