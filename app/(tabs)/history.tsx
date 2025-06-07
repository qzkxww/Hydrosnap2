import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { 
  Calendar,
  TrendingUp,
  Droplets,
  Smile,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import RippleChat from '@/components/RippleChat';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HistoryTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showRippleChat, setShowRippleChat] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const barAnimations = React.useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;
  const trendBarAnimations = React.useRef(
    Array.from({ length: 14 }, () => new Animated.Value(0))
  ).current;
  const statsAnimations = React.useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;

  // Mock data for visualization
  const weeklyData = [
    { day: 'Mon', water: 2100, mood: 3, energy: 2, date: '12/16' },
    { day: 'Tue', water: 2500, mood: 4, energy: 4, date: '12/17' },
    { day: 'Wed', water: 1800, mood: 2, energy: 2, date: '12/18' },
    { day: 'Thu', water: 2200, mood: 3, energy: 3, date: '12/19' },
    { day: 'Fri', water: 2800, mood: 5, energy: 4, date: '12/20' },
    { day: 'Sat', water: 2600, mood: 4, energy: 5, date: '12/21' },
    { day: 'Sun', water: 2400, mood: 4, energy: 3, date: '12/22' },
  ];

  const maxWater = Math.max(...weeklyData.map(d => d.water));
  const avgWater = Math.round(weeklyData.reduce((sum, d) => sum + d.water, 0) / weeklyData.length);
  const avgMood = (weeklyData.reduce((sum, d) => sum + d.mood, 0) / weeklyData.length).toFixed(1);
  const avgEnergy = (weeklyData.reduce((sum, d) => sum + d.energy, 0) / weeklyData.length).toFixed(1);

  // Trigger animations when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset all animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      barAnimations.forEach(anim => anim.setValue(0));
      trendBarAnimations.forEach(anim => anim.setValue(0));
      statsAnimations.forEach(anim => anim.setValue(0));

      // Start animations with staggered timing
      const animations = [
        // Fade in and slide up main content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),

        // Animate stats cards
        Animated.stagger(100, 
          statsAnimations.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          )
        ),

        // Animate water intake bars
        Animated.stagger(80, 
          barAnimations.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 120,
              friction: 8,
              useNativeDriver: false,
            })
          )
        ),

        // Animate trend bars (mood and energy)
        Animated.stagger(60, 
          trendBarAnimations.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 140,
              friction: 9,
              useNativeDriver: false,
            })
          )
        ),
      ];

      // Start animations in sequence
      Animated.sequence([
        animations[0], // Fade in
        Animated.delay(200),
        animations[1], // Stats cards
        Animated.delay(100),
        animations[2], // Water bars
        Animated.delay(150),
        animations[3], // Trend bars
      ]).start();

      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const getMoodColor = (level: number) => {
    if (level <= 2) return '#ef4444';
    if (level <= 3) return '#f59e0b';
    return '#10b981';
  };

  const getEnergyColor = (level: number) => {
    if (level <= 2) return '#6b7280';
    if (level <= 3) return '#3b82f6';
    return '#8b5cf6';
  };

  const AnimatedStatsCard = ({ children, index }: { children: React.ReactNode; index: number }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: statsAnimations[index],
          transform: [
            {
              scale: statsAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: statsAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  const AnimatedBar = ({ 
    height, 
    backgroundColor, 
    index, 
    children 
  }: { 
    height: number; 
    backgroundColor: string; 
    index: number;
    children: React.ReactNode;
  }) => (
    <View style={styles.chartBar}>
      <View style={styles.barContainer}>
        <Animated.View 
          style={[
            styles.bar,
            { 
              height: barAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [4, height],
              }),
              backgroundColor,
              opacity: barAnimations[index],
            }
          ]} 
        />
      </View>
      {children}
    </View>
  );

  const AnimatedTrendBar = ({ 
    height, 
    backgroundColor, 
    index 
  }: { 
    height: number; 
    backgroundColor: string; 
    index: number;
  }) => (
    <Animated.View 
      style={[
        styles.trendBar,
        { 
          height: trendBarAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [4, height],
          }),
          backgroundColor,
          opacity: trendBarAnimations[index],
        }
      ]} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Track your hydration journey</Text>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Week Navigation */}
          <View style={styles.weekNav}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentWeek(prev => prev - 1)}
            >
              <ChevronLeft size={20} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
            
            <Text style={styles.weekTitle}>
              {currentWeek === 0 ? 'This Week' : `${Math.abs(currentWeek)} week${Math.abs(currentWeek) > 1 ? 's' : ''} ago`}
            </Text>
            
            <TouchableOpacity 
              style={[styles.navButton, currentWeek >= 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentWeek(prev => prev + 1)}
              disabled={currentWeek >= 0}
            >
              <ChevronRight size={20} color={currentWeek >= 0 ? '#cbd5e1' : '#64748b'} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <AnimatedStatsCard index={0}>
            <Droplets size={20} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.statValue}>{avgWater}ml</Text>
            <Text style={styles.statLabel}>Daily Average</Text>
          </AnimatedStatsCard>
          
          <AnimatedStatsCard index={1}>
            <Smile size={20} color="#10b981" strokeWidth={2} />
            <Text style={styles.statValue}>{avgMood}</Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </AnimatedStatsCard>
          
          <AnimatedStatsCard index={2}>
            <Zap size={20} color="#8b5cf6" strokeWidth={2} />
            <Text style={styles.statValue}>{avgEnergy}</Text>
            <Text style={styles.statLabel}>Avg Energy</Text>
          </AnimatedStatsCard>
        </View>

        {/* Water Intake Chart */}
        <Animated.View 
          style={[
            styles.chartCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Water Intake</Text>
            <TrendingUp size={20} color="#0EA5E9" strokeWidth={2} />
          </View>
          
          <View style={styles.chart}>
            {weeklyData.map((day, index) => (
              <AnimatedBar
                key={index}
                height={(day.water / maxWater) * 120}
                backgroundColor={day.water >= 2500 ? '#10b981' : day.water >= 2000 ? '#f59e0b' : '#ef4444'}
                index={index}
              >
                <Animated.Text 
                  style={[
                    styles.barValue,
                    {
                      opacity: barAnimations[index],
                    }
                  ]}
                >
                  {day.water}
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.barLabel,
                    {
                      opacity: barAnimations[index],
                    }
                  ]}
                >
                  {day.day}
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.barDate,
                    {
                      opacity: barAnimations[index],
                    }
                  ]}
                >
                  {day.date}
                </Animated.Text>
              </AnimatedBar>
            ))}
          </View>
          
          <Animated.View 
            style={[
              styles.chartLegend,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Goal Met (2500ml+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Good (2000ml+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Below Target</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Mood & Energy Trends */}
        <Animated.View 
          style={[
            styles.trendsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.chartTitle}>Mood & Energy Correlation</Text>
          
          <View style={styles.trendChart}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.trendDay}>
                <Animated.Text 
                  style={[
                    styles.trendDayLabel,
                    {
                      opacity: fadeAnim,
                    }
                  ]}
                >
                  {day.day}
                </Animated.Text>
                
                <View style={styles.trendBars}>
                  <View style={styles.trendBarContainer}>
                    <AnimatedTrendBar
                      height={(day.mood / 5) * 40}
                      backgroundColor={getMoodColor(day.mood)}
                      index={index * 2}
                    />
                    <Animated.Text 
                      style={[
                        styles.trendBarLabel,
                        {
                          opacity: trendBarAnimations[index * 2],
                        }
                      ]}
                    >
                      M
                    </Animated.Text>
                  </View>
                  
                  <View style={styles.trendBarContainer}>
                    <AnimatedTrendBar
                      height={(day.energy / 5) * 40}
                      backgroundColor={getEnergyColor(day.energy)}
                      index={index * 2 + 1}
                    />
                    <Animated.Text 
                      style={[
                        styles.trendBarLabel,
                        {
                          opacity: trendBarAnimations[index * 2 + 1],
                        }
                      ]}
                    >
                      E
                    </Animated.Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          <Animated.View 
            style={[
              styles.trendLegend,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.legendItem}>
              <Text style={styles.legendText}>M = Mood</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendText}>E = Energy</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Ripple AI Insights */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity 
            style={styles.rippleInsightsCard}
            onPress={() => setShowRippleChat(true)}
          >
            <View style={styles.rippleHeader}>
              <View style={styles.rippleAvatarContainer}>
                <Sparkles size={20} color="#10b981" strokeWidth={2} />
              </View>
              <Text style={styles.rippleTitle}>Ask Ripple About Your Progress</Text>
            </View>
            
            <Text style={styles.rippleDescription}>
              Get personalized insights about your hydration patterns, mood correlations, and improvement suggestions.
            </Text>
            
            <View style={styles.rippleAction}>
              <Text style={styles.rippleActionText}>Chat with Ripple</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Weekly Insights */}
        <Animated.View 
          style={[
            styles.insightsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.chartTitle}>Weekly Insights</Text>
          
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              🎯 You hit your hydration goal <Text style={styles.insightHighlight}>3 out of 7 days</Text> this week
            </Text>
          </View>
          
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              📈 Your best day was Friday with <Text style={styles.insightHighlight}>2.8L consumed</Text>
            </Text>
          </View>
          
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              💡 Higher water intake correlated with better mood and energy levels
            </Text>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Ripple Chat Modal */}
      <Modal
        visible={showRippleChat}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <RippleChat
          waterIntake={avgWater}
          dailyGoal={2500}
          currentMood="medium"
          energyLevel="medium"
          onClose={() => setShowRippleChat(false)}
        />
      </Modal>
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
  title: {
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  weekTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
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
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'end',
    justifyContent: 'space-between',
    height: 180,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 2,
  },
  barDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  trendsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  trendDay: {
    alignItems: 'center',
    flex: 1,
  },
  trendDayLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 12,
  },
  trendBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  trendBarContainer: {
    alignItems: 'center',
  },
  trendBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
    marginBottom: 4,
  },
  trendBarLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  rippleInsightsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0fdf4',
  },
  rippleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rippleAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rippleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    flex: 1,
  },
  rippleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  rippleAction: {
    alignItems: 'center',
  },
  rippleActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  insight: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  insightHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#0EA5E9',
  },
});