// app/_layout.tsx
import React, { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Language } from './_types';

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
  const [lang, setLang] = useState<Language>('en');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]);
  };

  return (
    <AppContext.Provider value={{ isDarkMode, setIsDarkMode, lang, setLang, bookmarks, toggleBookmark }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="details" options={{ headerShown: true, title: 'Article Details' }} />
      </Stack>
    </AppContext.Provider>
  );
}