import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Activity, Thermometer, Target, Brain, ChartBar as BarChart3 } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface QuizQuestion {
  id: number;
  question: string;
  icon: React.ReactNode;
  options: string[];
  type: 'single' | 'slider';
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "How physically active are you on a typical day?",
    icon: <Activity size={32} color="#0EA5E9" strokeWidth={2} />,
    options: ["Sedentary", "Lightly Active", "Very Active", "Athlete"],
    type: 'single'
  },
  {
    id: 2,
    question: "What kind of climate do you live in?",
    icon: <Thermometer size={32} color="#f59e0b" strokeWidth={2} />,
    options: ["Cold", "Mild", "Hot", "Very Hot"],
    type: 'single'
  },
  {
    id: 3,
    question: "What's your primary hydration goal?",
    icon: <Target size={32} color="#10b981" strokeWidth={2} />,
    options: ["Boost Energy", "Improve Skin", "Increase Focus", "General Wellness"],
    type: 'single'
  },
  {
    id: 4,
    question: "How do you feel when you're not drinking enough water?",
    icon: <Brain size={32} color="#8b5cf6" strokeWidth={2} />,
    options: ["Fatigued", "Mentally Foggy", "Irritable", "Dry Skin"],
    type: 'single'
  },
  {
    id: 5,
    question: "How often do you currently drink water?",
    icon: <BarChart3 size={32} color="#ef4444" strokeWidth={2} />,
    options: ["Rarely", "Sometimes", "Often", "Very Often"],
    type: 'slider'
  }
];

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [sliderValue, setSliderValue] = useState(2);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswer = answers[question.id] !== undefined;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: answer
    }));
  };

  const handleSliderAnswer = (value: number) => {
    setSliderValue(value);
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      router.push('/onboarding/paywall');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.gradient}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#64748b" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestion + 1} of {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.iconContainer}>
            {question.icon}
          </View>
          
          <Text style={styles.questionText}>{question.question}</Text>
          
          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {question.type === 'single' ? (
              <View style={styles.optionsGrid}>
                {question.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      answers[question.id] === option && styles.optionButtonSelected
                    ]}
                    onPress={() => handleAnswer(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[question.id] === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>Rarely</Text>
                  <Text style={styles.sliderLabel}>Very Often</Text>
                </View>
                
                <View style={styles.sliderTrack}>
                  <View style={styles.sliderOptions}>
                    {question.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.sliderDot,
                          sliderValue === index && styles.sliderDotActive
                        ]}
                        onPress={() => handleSliderAnswer(index)}
                      >
                        <View style={styles.sliderDotInner} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <Text style={styles.sliderValue}>
                  {question.options[sliderValue]}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !hasAnswer && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!hasAnswer}
          >
            <Text style={[
              styles.nextButtonText,
              !hasAnswer && styles.nextButtonTextDisabled
            ]}>
              {isLastQuestion ? 'Complete' : 'Continue'}
            </Text>
            <ChevronRight 
              size={20} 
              color={hasAnswer ? '#ffffff' : '#cbd5e1'} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 20,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 8,
  },
  progressBar: {
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
  questionContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  questionText: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 48,
  },
  answersContainer: {
    alignItems: 'center',
  },
  optionsGrid: {
    gap: 16,
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#0EA5E9',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  sliderTrack: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  sliderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  sliderDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sliderDotActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#f0f9ff',
  },
  sliderDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  sliderValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0EA5E9',
  },
  navigation: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#f1f5f9',
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginRight: 8,
  },
  nextButtonTextDisabled: {
    color: '#cbd5e1',
  },
});