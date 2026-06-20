// app/(tabs)/profile.tsx
import React from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Platform } from 'react-native';
import { useApp } from '../_layout';
import { Language } from '../_types';

export default function ProfileScreen() {
  const { isDarkMode, setIsDarkMode, lang, setLang, bookmarks } = useApp();

  const containerBg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const elementBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const borderStyle = { borderColor: isDarkMode ? '#334155' : '#F1F5F9' };

  return (
    <View style={[styles.mainView, { backgroundColor: containerBg }]}>
      
      {/* Light / Dark Setting Module Block */}
      <View style={[styles.settingBlock, borderStyle, { backgroundColor: elementBg }]}>
        <View style={styles.flexRowSpacer}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={[styles.primaryLabel, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>Dark Theme Mode</Text>
            <Text style={styles.secondaryLabel}>Optimizes application display illumination controls</Text>
          </View>
          <Switch 
            value={isDarkMode}
            onValueChange={(v) => setIsDarkMode(v)}
            trackColor={{ false: '#E2E8F0', true: '#1A73E8' }}
            thumbColor={isDarkMode ? '#38BDF8' : '#FFFFFF'}
          />
        </View>
      </View>

      <Text style={styles.groupHeaderLabel}>Edition Feed Languages</Text>
      
      {/* Language Section Grid Selection Track */}
      <View style={[styles.settingBlock, borderStyle, { backgroundColor: elementBg, paddingVertical: 4 }]}>
        {(['en', 'hi', 'bn'] as Language[]).map((l, index) => {
          const isCurrent = lang === l;
          return (
            <TouchableOpacity
              key={l}
              onPress={() => setLang(l)}
              activeOpacity={0.7}
              style={[
                styles.listItemOption,
                index < 2 && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }
              ]}
            >
              <Text style={[
                styles.itemLabelText, 
                { color: isCurrent ? (isDarkMode ? '#38BDF8' : '#1A73E8') : (isDarkMode ? '#E2E8F0' : '#475569') },
                isCurrent && { fontWeight: '700' }
              ]}>
                {l === 'en' ? 'English (Global Press Feed)' : l === 'hi' ? 'हिंदी (भारतीय संस्करण)' : 'বাংলা (বাংলাদেশী সংস্করণ)'}
              </Text>
              {isCurrent && <Text style={{ fontSize: 13, color: isDarkMode ? '#38BDF8' : '#1A73E8', fontWeight: 'bold' }}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookmarked Stories Dashboard Metrics Module */}
      <View style={[styles.settingBlock, borderStyle, { backgroundColor: elementBg, marginTop: 16 }]}>
        <View style={styles.flexRowSpacer}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={[styles.primaryLabel, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>Stored Dispatches</Text>
            <Text style={styles.secondaryLabel}>Locally cached documents ready for browsing</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
            <Text style={[styles.countText, { color: isDarkMode ? '#38BDF8' : '#1A73E8' }]}>{bookmarks.length} saved</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: { flex: 1, padding: 16 },
  settingBlock: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000000', shadowOpacity: 0.02, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 }
    })
  },
  flexRowSpacer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  primaryLabel: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  secondaryLabel: { fontSize: 12, color: '#94A3B8', marginTop: 3, fontWeight: '500', lineHeight: 16 },
  
  groupHeaderLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginTop: 24, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 4 },
  listItemOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  itemLabelText: { fontSize: 13, fontWeight: '600' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: '800' }
});