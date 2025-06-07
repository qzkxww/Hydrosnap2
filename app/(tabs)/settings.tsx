import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { 
  Bell,
  Shield,
  Crown,
  Globe,
  Moon,
  Droplets,
  ChevronRight,
  Star,
  Coffee,
  LogOut
} from 'lucide-react-native';

export default function SettingsTab() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [metricUnits, setMetricUnits] = useState(true);

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    hasSwitch = false, 
    switchValue = false, 
    onSwitchToggle,
    rightElement,
    isPremium = false
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchToggle?: (value: boolean) => void;
    rightElement?: React.ReactNode;
    isPremium?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, isPremium && styles.premiumIcon]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <View style={styles.settingTitleRow}>
            <Text style={styles.settingTitle}>{title}</Text>
            {isPremium && <Crown size={14} color="#f59e0b" strokeWidth={2} />}
          </View>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchToggle}
            trackColor={{ false: '#e2e8f0', true: '#0EA5E9' }}
            thumbColor={switchValue ? '#ffffff' : '#ffffff'}
          />
        ) : rightElement ? (
          rightElement
        ) : (
          <ChevronRight size={20} color="#cbd5e1" strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your HydroSnap experience</Text>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
            <Crown size={24} color="#f59e0b" strokeWidth={2} />
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>HydroSnap Premium</Text>
              <Text style={styles.premiumSubtitle}>Advanced AI insights & unlimited history</Text>
            </View>
          </View>
          <View style={styles.premiumPrice}>
            <Text style={styles.priceText}>$39.99/year</Text>
            <Text style={styles.priceSubtext}>3-day free trial</Text>
          </View>
        </TouchableOpacity>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon={<Bell size={20} color="#0EA5E9" strokeWidth={2} />}
            title="Hydration Reminders"
            subtitle="Get personalized reminders throughout the day"
            hasSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchToggle={setNotificationsEnabled}
          />
          
          <SettingItem
            icon={<Coffee size={20} color="#8b5cf6" strokeWidth={2} />}
            title="Smart Scheduling"
            subtitle="AI-powered reminder timing"
            isPremium
            rightElement={
              <View style={styles.premiumTag}>
                <Text style={styles.premiumTagText}>PRO</Text>
              </View>
            }
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon={<Droplets size={20} color="#10b981" strokeWidth={2} />}
            title="Daily Goal"
            subtitle="Currently set to 2.5L"
            onPress={() => {}}
          />
          
          <SettingItem
            icon={<Globe size={20} color="#3b82f6" strokeWidth={2} />}
            title="Units"
            subtitle={metricUnits ? "Metric (ml, L)" : "Imperial (fl oz, cups)"}
            hasSwitch={true}
            switchValue={metricUnits}
            onSwitchToggle={setMetricUnits}
          />
          
          <SettingItem
            icon={<Moon size={20} color="#6366f1" strokeWidth={2} />}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            hasSwitch={true}
            switchValue={darkModeEnabled}
            onSwitchToggle={setDarkModeEnabled}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={<Shield size={20} color="#ef4444" strokeWidth={2} />}
            title="Privacy & Data"
            subtitle="Manage your data and privacy settings"
            onPress={() => {}}
          />
          
          <SettingItem
            icon={<Star size={20} color="#f59e0b" strokeWidth={2} />}
            title="Rate HydroSnap"
            subtitle="Share your experience on the App Store"
            onPress={() => {}}
          />
          
          <SettingItem
            icon={<LogOut size={20} color="#64748b" strokeWidth={2} />}
            title="Sign Out"
            onPress={() => {}}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>HydroSnap v1.0.0</Text>
          <Text style={styles.appDescription}>
            AI-powered hydration tracking for better health and energy
          </Text>
        </View>

      </ScrollView>
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
  premiumBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#fef3c7',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumText: {
    marginLeft: 16,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  premiumPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#f59e0b',
  },
  priceSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  premiumIcon: {
    backgroundColor: '#fef3c7',
  },
  settingText: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 2,
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTag: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumTagText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});