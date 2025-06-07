import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Send, Bot, User, Sparkles, Droplets } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface RippleChatProps {
  waterIntake: number;
  dailyGoal: number;
  currentMood: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  onClose?: () => void;
}

export default function RippleChat({ 
  waterIntake, 
  dailyGoal, 
  currentMood, 
  energyLevel,
  onClose 
}: RippleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm Ripple, your AI hydration assistant. I see you're at ${waterIntake}ml today - that's ${Math.round((waterIntake / dailyGoal) * 100)}% of your goal! How can I help you stay hydrated?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Animation values for messages
  const messageAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  // Animate new messages
  useEffect(() => {
    messages.forEach((message) => {
      if (!messageAnimations[message.id]) {
        messageAnimations[message.id] = new Animated.Value(0);
        
        // Animate message appearance
        Animated.spring(messageAnimations[message.id], {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [messages]);

  const generateRippleResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Hydration advice
    if (lowerMessage.includes('tired') || lowerMessage.includes('energy')) {
      return `I notice your energy is ${energyLevel}. Dehydration is a major cause of fatigue! Try drinking 250ml now and another glass in 30 minutes. Your brain is 75% water, so even mild dehydration can affect your energy levels.`;
    }
    
    if (lowerMessage.includes('remind') || lowerMessage.includes('forget')) {
      return `I can help you remember! Based on your current intake, I recommend drinking water every 90 minutes. Would you like me to send you gentle reminders? I'll make them personalized based on your activity and mood.`;
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      const remaining = dailyGoal - waterIntake;
      if (remaining <= 0) {
        return `Amazing! You've already hit your ${dailyGoal}ml goal today! 🎉 Keep sipping to maintain optimal hydration. Your body will thank you!`;
      }
      return `You need ${remaining}ml more to reach your ${dailyGoal}ml goal. That's about ${Math.ceil(remaining / 250)} more glasses. You're doing great - ${Math.round((waterIntake / dailyGoal) * 100)}% there!`;
    }
    
    if (lowerMessage.includes('mood') || lowerMessage.includes('feel')) {
      if (currentMood === 'low') {
        return `I see your mood is low today. Dehydration can definitely affect how we feel! Try drinking a full glass of water slowly. Studies show that even 2% dehydration can impact mood and cognitive function.`;
      }
      return `Your mood seems ${currentMood} today! Staying hydrated helps maintain stable energy and mood throughout the day. Keep up the great work!`;
    }
    
    if (lowerMessage.includes('skin') || lowerMessage.includes('glow')) {
      return `Great question! Proper hydration is key for healthy, glowing skin. Your skin is 30% water, so staying hydrated helps maintain elasticity and that natural glow. Aim for consistent intake throughout the day rather than large amounts at once.`;
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return `For workouts, drink 250ml about 30 minutes before exercising, then 150-200ml every 15-20 minutes during activity. After your workout, drink 150% of the fluid you lost through sweat. Your performance can drop by 10% with just 2% dehydration!`;
    }
    
    if (lowerMessage.includes('morning') || lowerMessage.includes('wake')) {
      return `Perfect timing! Your body loses about 1-2 pounds of water overnight through breathing and sweating. Start your day with 500ml of water to rehydrate and kickstart your metabolism. It's like giving your body a gentle wake-up call!`;
    }
    
    if (lowerMessage.includes('coffee') || lowerMessage.includes('caffeine')) {
      return `Coffee counts toward hydration, but caffeine has a mild diuretic effect. For every cup of coffee, try to drink an extra glass of water. The good news? Your body adapts to regular caffeine intake, so the diuretic effect decreases over time.`;
    }
    
    // Encouragement and tips
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
      return `I understand! Building new habits takes time. Try these tricks: use a water bottle with time markers, add a slice of lemon or cucumber for flavor, or set your phone to remind you every hour. Small, consistent steps lead to big changes!`;
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return `You're so welcome! I'm here to support your hydration journey. Remember, every sip counts, and you're already making great progress. Keep up the amazing work! 💧`;
    }
    
    // Default responses
    const defaultResponses = [
      `That's a great question! Based on your current progress (${waterIntake}ml today), you're doing well. Remember, consistency is key - small, frequent sips work better than large amounts at once.`,
      `I'm here to help you succeed! Your hydration journey is unique, and I'll provide personalized tips based on your mood, energy, and daily patterns. What specific area would you like to focus on?`,
      `Interesting! Did you know that your brain is 75% water? That's why proper hydration is so important for focus, mood, and energy. How has your hydration been affecting how you feel today?`,
      `Every drop counts! You're ${Math.round((waterIntake / dailyGoal) * 100)}% toward your goal. I love helping people discover how much better they feel when properly hydrated. What changes have you noticed?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateRippleResponse(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const TypingIndicator = () => (
    <Animated.View 
      style={[
        styles.typingContainer,
        {
          opacity: typingAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          }),
          transform: [
            {
              scale: typingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.messageAvatar}>
        <Bot size={16} color="#0EA5E9" strokeWidth={2} />
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDots, { opacity: typingAnimation }]}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: messageAnimations['header'] || 1,
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.rippleInfo}>
            <View style={styles.rippleAvatar}>
              <Sparkles size={24} color="#0EA5E9" strokeWidth={2} />
            </View>
            <View style={styles.rippleTextContainer}>
              <Text style={styles.headerTitle}>Ripple</Text>
              <Text style={styles.headerSubtitle}>AI Hydration Assistant</Text>
            </View>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <Animated.View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
              {
                opacity: messageAnimations[message.id] || 0,
                transform: [
                  {
                    translateY: messageAnimations[message.id]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }) || 20,
                  },
                  {
                    scale: messageAnimations[message.id]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }) || 0.9,
                  },
                ],
              },
            ]}
          >
            {!message.isUser && (
              <View style={styles.messageAvatar}>
                <Bot size={16} color="#0EA5E9" strokeWidth={2} />
              </View>
            )}
            
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.aiMessageTime
                ]}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {message.isUser && (
              <View style={styles.messageAvatar}>
                <User size={16} color="#64748b" strokeWidth={2} />
              </View>
            )}
          </Animated.View>
        ))}
        
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input */}
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            opacity: messageAnimations['input'] || 1,
            transform: [
              {
                translateY: messageAnimations['input']?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }) || 0,
              },
            ],
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Ripple about hydration..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Send 
              size={20} 
              color={inputText.trim() ? "#ffffff" : "#cbd5e1"} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flex: 1,
  },
  rippleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rippleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rippleTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#0EA5E9',
    borderBottomRightRadius: 6,
  },
  aiMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#94a3b8',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
});