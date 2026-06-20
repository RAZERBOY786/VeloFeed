// app/details.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useApp } from './_layout';

export default function DetailsScreen() {
  const { title, url } = useLocalSearchParams<{ title: string; url: string }>();
  const { isDarkMode } = useApp();

  return (
    <View style={[styles.wrapper, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <Stack.Screen 
        options={{ 
          title: 'Reading Article', 
          headerTintColor: isDarkMode ? '#fff' : '#000', 
          headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#fff' } 
        }} 
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.headline, { color: isDarkMode ? '#fff' : '#000' }]}>{title}</Text>
        <Text style={{ color: '#007AFF', marginTop: 15, fontWeight: '500' }}>Source URL Link:</Text>
        <Text style={{ color: '#888', marginTop: 4 }}>{url}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  headline: { fontSize: 22, fontWeight: 'bold', lineHeight: 28 }
});