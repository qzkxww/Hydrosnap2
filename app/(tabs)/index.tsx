import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Plus, Target, Zap, Smile, CreditCard as Edit3, X, Check, Sparkles } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import SmartDrinkEntry from '@/components/SmartDrinkEntry';
import { saveDrinkLog, getTodaysDrinkLogs } from '@/lib/supabase';

export default function HomeTab() {
  const [waterIntake, setWaterIntake] = useState(1200);
  const [dailyGoal] = useState(2500);
  const [currentMood, setCurrentMood] = useState<'low' | 'medium' | 'high'>('medium');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showSmartEntry, setShowSmartEntry] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const circleScaleAnimation = useRef(new Animated.Value(1)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const progressCardAnimation = useRef(new Animated.Value(0)).current;
  const quickActionsAnimation = useRef(new Animated.Value(0)).current;
  const trackerCardAnimation = useRef(new Animated.Value(0)).current;
  const tipsCardAnimation = useRef(new Animated.Value(0)).current;

  // Individual button animations
  const buttonAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)) // Updated to 5 for smart entry button
  ).current;

  // Mood and energy tracker animations
  const moodTrackerAnimation = useRef(new Animated.Value(0)).current;
  const energyTrackerAnimation = useRef(new Animated.Value(0)).current;

  const progress = Math.min(waterIntake / dailyGoal, 1);
  const remainingWater = Math.max(dailyGoal - waterIntake, 0);

  // Load today's intake on focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodaysIntake();
    }, [])
  );

  const loadTodaysIntake = async () => {
    try {
      const logs = await getTodaysDrinkLogs();
      const totalIntake = logs.reduce((sum, log) => {
        return sum + (log.volume_ml * log.hydration_score);
      }, 0);
      setWaterIntake(Math.round(totalIntake));
    } catch (error) {
      console.error('Error loading today\'s intake:', error);
    }
  };

  // Trigger animations when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      progressAnimation.setValue(0);
      circleScaleAnimation.setValue(1);
      headerAnimation.setValue(0);
      progressCardAnimation.setValue(0);
      quickActionsAnimation.setValue(0);
      trackerCardAnimation.setValue(0);
      tipsCardAnimation.setValue(0);
      moodTrackerAnimation.setValue(0);
      energyTrackerAnimation.setValue(0);
      buttonAnimations.forEach(anim => anim.setValue(0));

      // Start animations in sequence
      const animations = [
        // Header animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(headerAnimation, {
            toValue: 1,
            tension: 150,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),

        // Progress card animation
        Animated.spring(progressCardAnimation, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),

        // Progress bar animation
        Animated.timing(progressAnimation, {
          toValue: progress,
          duration: 800,
          useNativeDriver: false,
        }),

        // Quick actions animation (staggered)
        Animated.stagger(60, [
          Animated.spring(quickActionsAnimation, {
            toValue: 1,
            tension: 150,
            friction: 6,
            useNativeDriver: true,
          }),
          ...buttonAnimations.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 180,
              friction: 7,
              useNativeDriver: true,
            })
          )
        ]),

        // Tracker card animation
        Animated.spring(trackerCardAnimation, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),

        // Mood and energy tracker animations (staggered)
        Animated.stagger(80, [
          Animated.spring(moodTrackerAnimation, {
            toValue: 1,
            tension: 200,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(energyTrackerAnimation, {
            toValue: 1,
            tension: 200,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),

        // Tips card animation
        Animated.spring(tipsCardAnimation, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),
      ];

      // Execute animations in sequence
      Animated.sequence([
        animations[0], // Header
        Animated.delay(50),
        animations[1], // Progress card
        Animated.delay(100),
        animations[2], // Progress bar
        Animated.delay(50),
        animations[3], // Quick actions
        Animated.delay(80),
        animations[4], // Tracker card
        Animated.delay(50),
        animations[5], // Mood/Energy trackers
        Animated.delay(50),
        animations[6], // Tips card
      ]).start();

      return () => {
        // Cleanup if needed
      };
    }, [progress])
  );

  const addWater = async (amount: number) => {
    try {
      setIsLoading(true);
      
      // Save to database
      await saveDrinkLog({
        name: 'Water',
        volume_ml: amount,
        hydration_score: 1.0,
        drink_type: 'water',
        source: 'quick_action'
      });

      // Update local state
      const newIntake = Math.min(waterIntake + amount, dailyGoal);
      setWaterIntake(newIntake);

      // Animate the progress bar
      const newProgress = Math.min(newIntake / dailyGoal, 1);
      
      // Circle scale animation for feedback
      Animated.sequence([
        Animated.timing(circleScaleAnimation, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(circleScaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar animation
      Animated.timing(progressAnimation, {
        toValue: newProgress,
        duration: 400,
        useNativeDriver: false,
      }).start();

    } catch (error) {
      console.error('Error adding water:', error);
      Alert.alert('Error', 'Failed to save water intake');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmount = async () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount in ml');
      return;
    }
    if (amount > 2000) {
      Alert.alert('Too Much', 'Please enter an amount less than 2000ml');
      return;
    }
    
    await addWater(amount);
    setCustomAmount('');
    setShowCustomModal(false);
  };

  const handleSmartDrinkSave = async (drinkData: {
    name: string;
    volume_ml: number;
    hydration_score: number;
    caffeine_mg?: number;
    drink_type?: string;
  }) => {
    try {
      setIsLoading(true);
      
      await saveDrinkLog({
        ...drinkData,
        source: 'ai'
      });

      // Update local state with hydration-adjusted amount
      const hydrationAdjustedAmount = Math.round(drinkData.volume_ml * drinkData.hydration_score);
      const newIntake = Math.min(waterIntake + hydrationAdjustedAmount, dailyGoal);
      setWaterIntake(newIntake);

      // Animate progress
      const newProgress = Math.min(newIntake / dailyGoal, 1);
      Animated.timing(progressAnimation, {
        toValue: newProgress,
        duration: 400,
        useNativeDriver: false,
      }).start();

    } catch (error) {
      console.error('Error saving smart drink:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodChange = (mood: 'low' | 'medium' | 'high') => {
    setCurrentMood(mood);
    
    // Animate mood tracker
    Animated.sequence([
      Animated.timing(moodTrackerAnimation, {
        toValue: 0.9,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(moodTrackerAnimation, {
        toValue: 1,
        tension: 250,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEnergyChange = (energy: 'low' | 'medium' | 'high') => {
    setEnergyLevel(energy);
    
    // Animate energy tracker
    Animated.sequence([
      Animated.timing(energyTrackerAnimation, {
        toValue: 0.9,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(energyTrackerAnimation, {
        toValue: 1,
        tension: 250,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const moodColor = {
    low: '#ef4444',
    medium: '#f59e0b',
    high: '#10b981'
  };

  const energyColor = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#8b5cf6'
  };

  const AnimatedQuickActionButton = ({ children, index, onPress }: { 
    children: React.ReactNode; 
    index: number;
    onPress: () => void;
  }) => (
    <Animated.View
      style={{
        opacity: buttonAnimations[index],
        transform: [
          {
            scale: buttonAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
          {
            translateY: buttonAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={onPress}
        disabled={isLoading}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Logo */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: headerAnimation },
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Droplets size={24} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.logoText}>HydroSnap</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.subtitle}>Let's stay hydrated today</Text>
          </View>
        </Animated.View>

        {/* Main Progress Card */}
        <Animated.View 
          style={[
            styles.progressCard,
            {
              opacity: progressCardAnimation,
              transform: [
                {
                  scale: progressCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
                {
                  translateY: progressCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.progressRingContainer}>
            {/* Circular Progress Ring */}
            <Animated.View 
              style={[
                styles.progressRing,
                {
                  transform: [{ scale: circleScaleAnimation }]
                }
              ]}
            >
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                style={styles.progressRingGradient}
              >
                <View style={styles.progressRingInner}>
                  <View style={styles.progressCenter}>
                    <Droplets size={32} color="#0EA5E9" strokeWidth={2} />
                    <Text style={styles.progressText}>{waterIntake}ml</Text>
                    <Text style={styles.progressGoal}>of {dailyGoal}ml</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.remainingText}>
              {remainingWater > 0 
                ? `${remainingWater}ml to go` 
                : 'Goal achieved!'
              }
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.quickActions,
            {
              opacity: quickActionsAnimation,
              transform: [
                {
                  translateY: quickActionsAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AnimatedQuickActionButton index={0} onPress={() => addWater(250)}>
            <View style={styles.actionIcon}>
              <Plus size={20} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>250ml</Text>
          </AnimatedQuickActionButton>
          
          <AnimatedQuickActionButton index={1} onPress={() => addWater(500)}>
            <View style={styles.actionIcon}>
              <Plus size={20} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>500ml</Text>
          </AnimatedQuickActionButton>
          
          <AnimatedQuickActionButton index={2} onPress={() => addWater(750)}>
            <View style={styles.actionIcon}>
              <Plus size={20} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>750ml</Text>
          </AnimatedQuickActionButton>

          <AnimatedQuickActionButton index={3} onPress={() => setShowCustomModal(true)}>
            <View style={[styles.actionIcon, styles.customActionIcon]}>
              <Edit3 size={20} color="#8b5cf6" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Custom</Text>
          </AnimatedQuickActionButton>

          <AnimatedQuickActionButton index={4} onPress={() => setShowSmartEntry(true)}>
            <View style={[styles.actionIcon, styles.smartActionIcon]}>
              <Sparkles size={20} color="#10b981" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Smart</Text>
          </AnimatedQuickActionButton>
        </Animated.View>

        {/* Mood & Energy Tracker */}
        <Animated.View 
          style={[
            styles.trackerCard,
            {
              opacity: trackerCardAnimation,
              transform: [
                {
                  scale: trackerCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
                {
                  translateY: trackerCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          
          <View style={styles.trackerRow}>
            <Animated.View 
              style={[
                styles.trackerItem,
                {
                  transform: [{ scale: moodTrackerAnimation }],
                },
              ]}
            >
              <Smile size={20} color={moodColor[currentMood]} strokeWidth={2} />
              <Text style={styles.trackerLabel}>Mood</Text>
              <View style={styles.trackerButtons}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.trackerButton,
                      currentMood === level && { backgroundColor: moodColor[level as keyof typeof moodColor] }
                    ]}
                    onPress={() => handleMoodChange(level as 'low' | 'medium' | 'high')}
                  >
                    <View style={[
                      styles.trackerDot,
                      { backgroundColor: currentMood === level ? '#fff' : moodColor[level as keyof typeof moodColor] }
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.trackerItem,
                {
                  transform: [{ scale: energyTrackerAnimation }],
                },
              ]}
            >
              <Zap size={20} color={energyColor[energyLevel]} strokeWidth={2} />
              <Text style={styles.trackerLabel}>Energy</Text>
              <View style={styles.trackerButtons}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.trackerButton,
                      energyLevel === level && { backgroundColor: energyColor[level as keyof typeof energyColor] }
                    ]}
                    onPress={() => handleEnergyChange(level as 'low' | 'medium' | 'high')}
                  >
                    <View style={[
                      styles.trackerDot,
                      { backgroundColor: energyLevel === level ? '#fff' : energyColor[level as keyof typeof energyColor] }
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Daily Tips */}
        <Animated.View 
          style={[
            styles.tipsCard,
            {
              opacity: tipsCardAnimation,
              transform: [
                {
                  scale: tipsCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
                {
                  translateY: tipsCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.tipsHeader}>
            <Target size={20} color="#8b5cf6" strokeWidth={2} />
            <Text style={styles.tipsTitle}>Today's Tip</Text>
          </View>
          <Text style={styles.tipsText}>
            Try the new Smart Drink Entry to log any beverage with AI-powered analysis. Just describe what you're drinking!
          </Text>
        </Animated.View>

      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Amount</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCustomModal(false)}
              >
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Enter amount in ml:</Text>
              <TextInput
                style={styles.modalInput}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="e.g. 300"
                keyboardType="numeric"
                maxLength={4}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowCustomModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalConfirmButton,
                    (!customAmount.trim() || isLoading) && styles.modalConfirmButtonDisabled
                  ]}
                  onPress={handleCustomAmount}
                  disabled={!customAmount.trim() || isLoading}
                >
                  <Check size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.modalConfirmText}>Add Water</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Smart Drink Entry Modal */}
      <SmartDrinkEntry
        visible={showSmartEntry}
        onClose={() => setShowSmartEntry(false)}
        onSave={handleSmartDrinkSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0EA5E9',
    marginLeft: 8,
  },
  headerContent: {
    // Header content styles
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  progressRingContainer: {
    marginBottom: 24,
  },
  progressRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 8,
  },
  progressRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginTop: 8,
  },
  progressGoal: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  progressStats: {
    alignItems: 'center',
    width: '100%',
  },
  remainingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0EA5E9',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  customActionIcon: {
    backgroundColor: '#faf5ff',
  },
  smartActionIcon: {
    backgroundColor: '#f0fdf4',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  trackerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 20,
  },
  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trackerItem: {
    alignItems: 'center',
    flex: 1,
  },
  trackerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 12,
  },
  trackerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trackerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  trackerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginLeft: 12,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalConfirmText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});