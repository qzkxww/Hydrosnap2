import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Search, Sparkles, Coffee, Droplets, Plus, X, Check, CircleAlert as AlertCircle, Zap } from 'lucide-react-native';

interface DrinkData {
  name: string;
  volume_ml: number;
  hydration_score: number;
  caffeine_mg?: number;
  drink_type?: string;
}

interface SmartDrinkEntryProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drinkData: DrinkData) => Promise<void>;
}

export default function SmartDrinkEntry({ visible, onClose, onSave }: SmartDrinkEntryProps) {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<DrinkData | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Manual form fields
  const [manualName, setManualName] = useState('');
  const [manualVolume, setManualVolume] = useState('');
  const [manualType, setManualType] = useState('water');
  const [manualHydration, setManualHydration] = useState('1.0');
  const [manualCaffeine, setManualCaffeine] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const debouncedAISearch = useCallback((text: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim().length > 3) {
        performAISearch(text);
      }
    }, 800);
  }, []);

  const performAISearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setAiResult(null);

    try {
      // Mock AI response for now - in production, this would call OpenAI API
      // You would implement this as an edge function or API route
      const mockAIResponse = await mockOpenAICall(query);
      
      if (mockAIResponse) {
        setAiResult(mockAIResponse);
      } else {
        setShowManualForm(true);
      }
    } catch (err) {
      setError('Failed to analyze drink. Please try manual entry.');
      setShowManualForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI function - replace with actual OpenAI integration
  const mockOpenAICall = async (query: string): Promise<DrinkData | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerQuery = query.toLowerCase();
    
    // Simple pattern matching for demo
    if (lowerQuery.includes('coffee')) {
      return {
        name: 'Coffee',
        volume_ml: extractVolume(query) || 240,
        hydration_score: 0.85,
        caffeine_mg: 95,
        drink_type: 'coffee'
      };
    } else if (lowerQuery.includes('tea')) {
      return {
        name: 'Tea',
        volume_ml: extractVolume(query) || 240,
        hydration_score: 0.95,
        caffeine_mg: 25,
        drink_type: 'tea'
      };
    } else if (lowerQuery.includes('water')) {
      return {
        name: 'Water',
        volume_ml: extractVolume(query) || 250,
        hydration_score: 1.0,
        caffeine_mg: 0,
        drink_type: 'water'
      };
    } else if (lowerQuery.includes('juice')) {
      return {
        name: 'Fruit Juice',
        volume_ml: extractVolume(query) || 200,
        hydration_score: 0.7,
        caffeine_mg: 0,
        drink_type: 'juice'
      };
    }
    
    return null;
  };

  const extractVolume = (text: string): number | null => {
    const volumeMatch = text.match(/(\d+)\s*(ml|milliliters?|oz|ounces?)/i);
    if (volumeMatch) {
      const value = parseInt(volumeMatch[1]);
      const unit = volumeMatch[2].toLowerCase();
      
      if (unit.startsWith('oz')) {
        return Math.round(value * 29.5735); // Convert oz to ml
      }
      return value;
    }
    return null;
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setError(null);
    setAiResult(null);
    setShowManualForm(false);
    
    if (text.trim()) {
      debouncedAISearch(text);
    }
  };

  const handleSaveAIResult = async () => {
    if (!aiResult) return;
    
    try {
      await onSave(aiResult);
      handleClose();
    } catch (err) {
      setError('Failed to save drink entry');
    }
  };

  const handleSaveManual = async () => {
    if (!manualName.trim() || !manualVolume.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const volume = parseInt(manualVolume);
    if (isNaN(volume) || volume <= 0) {
      setError('Please enter a valid volume');
      return;
    }

    const hydration = parseFloat(manualHydration);
    if (isNaN(hydration) || hydration < 0 || hydration > 1) {
      setError('Hydration score must be between 0 and 1');
      return;
    }

    const drinkData: DrinkData = {
      name: manualName.trim(),
      volume_ml: volume,
      hydration_score: hydration,
      drink_type: manualType,
      caffeine_mg: manualCaffeine ? parseInt(manualCaffeine) : 0,
    };

    try {
      await onSave(drinkData);
      handleClose();
    } catch (err) {
      setError('Failed to save drink entry');
    }
  };

  const handleClose = () => {
    setSearchText('');
    setAiResult(null);
    setShowManualForm(false);
    setError(null);
    setManualName('');
    setManualVolume('');
    setManualType('water');
    setManualHydration('1.0');
    setManualCaffeine('');
    onClose();
  };

  const getDrinkTypeIcon = (type: string) => {
    switch (type) {
      case 'coffee': return <Coffee size={20} color="#8b5cf6" strokeWidth={2} />;
      case 'tea': return <Coffee size={20} color="#10b981" strokeWidth={2} />;
      case 'water': return <Droplets size={20} color="#0EA5E9" strokeWidth={2} />;
      default: return <Droplets size={20} color="#64748b" strokeWidth={2} />;
    }
  };

  const getHydrationColor = (score: number) => {
    if (score >= 0.9) return '#10b981';
    if (score >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Sparkles size={24} color="#0EA5E9" strokeWidth={2} />
              <Text style={styles.title}>Smart Drink Entry</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search Input */}
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Describe your drink</Text>
              <Text style={styles.sectionSubtitle}>
                e.g., "iced matcha latte 300ml" or "large coffee"
              </Text>
              
              <View style={styles.searchContainer}>
                <Search size={20} color="#64748b" strokeWidth={2} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={handleSearchChange}
                  placeholder="Type your drink..."
                  placeholderTextColor="#94a3b8"
                  autoFocus={true}
                />
                {isLoading && (
                  <ActivityIndicator size="small\" color="#0EA5E9" />
                )}
              </View>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ef4444" strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* AI Result */}
            {aiResult && (
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>AI Analysis</Text>
                
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    {getDrinkTypeIcon(aiResult.drink_type || 'water')}
                    <Text style={styles.resultName}>{aiResult.name}</Text>
                  </View>
                  
                  <View style={styles.resultDetails}>
                    <View style={styles.resultItem}>
                      <Droplets size={16} color="#0EA5E9" strokeWidth={2} />
                      <Text style={styles.resultLabel}>Volume</Text>
                      <Text style={styles.resultValue}>{aiResult.volume_ml}ml</Text>
                    </View>
                    
                    <View style={styles.resultItem}>
                      <View style={[
                        styles.hydrationDot, 
                        { backgroundColor: getHydrationColor(aiResult.hydration_score) }
                      ]} />
                      <Text style={styles.resultLabel}>Hydration</Text>
                      <Text style={styles.resultValue}>
                        {Math.round(aiResult.hydration_score * 100)}%
                      </Text>
                    </View>
                    
                    {aiResult.caffeine_mg && aiResult.caffeine_mg > 0 && (
                      <View style={styles.resultItem}>
                        <Zap size={16} color="#f59e0b" strokeWidth={2} />
                        <Text style={styles.resultLabel}>Caffeine</Text>
                        <Text style={styles.resultValue}>{aiResult.caffeine_mg}mg</Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveAIResult}>
                    <Check size={20} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.saveButtonText}>Add to Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Manual Form */}
            {showManualForm && (
              <View style={styles.manualSection}>
                <Text style={styles.sectionTitle}>Manual Entry</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Drink Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={manualName}
                    onChangeText={setManualName}
                    placeholder="e.g., Green Tea"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Volume (ml) *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={manualVolume}
                      onChangeText={setManualVolume}
                      placeholder="250"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Hydration Score</Text>
                    <TextInput
                      style={styles.formInput}
                      value={manualHydration}
                      onChangeText={setManualHydration}
                      placeholder="1.0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Type</Text>
                    <View style={styles.typeSelector}>
                      {['water', 'coffee', 'tea', 'juice', 'other'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeOption,
                            manualType === type && styles.typeOptionSelected
                          ]}
                          onPress={() => setManualType(type)}
                        >
                          <Text style={[
                            styles.typeOptionText,
                            manualType === type && styles.typeOptionTextSelected
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Caffeine (mg)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={manualCaffeine}
                      onChangeText={setManualCaffeine}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveManual}>
                  <Plus size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.saveButtonText}>Add to Log</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Actions */}
            {!aiResult && !showManualForm && !isLoading && searchText.length === 0 && (
              <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Add</Text>
                
                <View style={styles.quickGrid}>
                  {[
                    { name: 'Water', volume: 250, icon: 'water', score: 1.0 },
                    { name: 'Coffee', volume: 240, icon: 'coffee', score: 0.85, caffeine: 95 },
                    { name: 'Tea', volume: 240, icon: 'tea', score: 0.95, caffeine: 25 },
                    { name: 'Juice', volume: 200, icon: 'juice', score: 0.7 },
                  ].map((drink, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickItem}
                      onPress={() => onSave({
                        name: drink.name,
                        volume_ml: drink.volume,
                        hydration_score: drink.score,
                        caffeine_mg: drink.caffeine || 0,
                        drink_type: drink.icon
                      }).then(handleClose)}
                    >
                      {getDrinkTypeIcon(drink.icon)}
                      <Text style={styles.quickItemName}>{drink.name}</Text>
                      <Text style={styles.quickItemVolume}>{drink.volume}ml</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ef4444',
    marginLeft: 8,
  },
  resultSection: {
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginLeft: 12,
  },
  resultDetails: {
    gap: 12,
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  hydrationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  manualSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeOptionSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  typeOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  typeOptionTextSelected: {
    color: '#ffffff',
  },
  quickActions: {
    marginBottom: 24,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickItemName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginTop: 8,
  },
  quickItemVolume: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 2,
  },
});