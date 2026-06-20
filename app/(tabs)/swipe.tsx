// app/(tabs)/swipe.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, Share, Linking, Platform, Alert, Animated, Dimensions } from 'react-native';
import { useApp } from '../_layout';
import { MaterialIcons } from '@expo/vector-icons';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  time: string;
  imageUrl: string;
  url: string;
}

const API_KEY = 'pub_5e77f2be0c024de0a3d9dcdbff3c6bd1';
const BASE_URL = 'https://newsdata.io/api/1/latest';

const BACKUP_FINANCIAL_NEWS: NewsItem[] = [
  {
    id: 'b1',
    title: 'Global Markets Pivot as Federal Reserve Signals Rate Cuts Amid Cooling Inflation',
    description: 'International equity indexes rallied today after central bank officials hinted at a strategic shift in monetary policy. Analysts suggest lower interest rates could spur fresh venture capital inflows into emerging tech ecosystems.',
    source: 'Bloomberg',
    time: 'Today',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop',
    url: 'https://www.bloomberg.com'
  },
  {
    id: 'b2',
    title: 'AI Hardware Infrastructure Supercycle Drives Record Revenue Across Semiconductor Stocks',
    description: 'The demand for enterprise machine learning hardware and large language model optimization platforms shows no signs of slowing down. Leading chip manufacturers reported a massive 45% surge.',
    source: 'Reuters Financial',
    time: 'Today',
    imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=600&auto=format&fit=crop',
    url: 'https://www.reuters.com'
  }
];

export default function FinancialBriefingScreen() {
  const { isDarkMode } = useApp();
  const [briefings, setBriefings] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 🪐 Ambient Background Aura Animation Vectors
  const aura1X = useRef(new Animated.Value(0)).current;
  const aura1Y = useRef(new Animated.Value(0)).current;
  const aura2X = useRef(new Animated.Value(0)).current;
  const aura2Y = useRef(new Animated.Value(0)).current;

  const containerBg = isDarkMode ? '#0F172A' : '#F6F8FA';
  const glassCardBg = isDarkMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)';
  const glassBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const primaryText = isDarkMode ? '#F8FAFC' : '#1E293B';
  const subText = isDarkMode ? '#94A3B8' : '#64748B';

  useEffect(() => {
    const createAuraLoop = (xValue: Animated.Value, yValue: Animated.Value, xMax: number, yMax: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(xValue, { toValue: xMax, duration, useNativeDriver: true }),
            Animated.timing(yValue, { toValue: yMax, duration: duration * 1.2, useNativeDriver: true })
          ]),
          Animated.parallel([
            Animated.timing(xValue, { toValue: 0, duration, useNativeDriver: true }),
            Animated.timing(yValue, { toValue: 0, duration: duration * 1.2, useNativeDriver: true })
          ])
        ])
      );
    };

    const loop1 = createAuraLoop(aura1X, aura1Y, WINDOW_WIDTH * 0.35, WINDOW_HEIGHT * 0.2, 20000);
    const loop2 = createAuraLoop(aura2X, aura2Y, -WINDOW_WIDTH * 0.4, -WINDOW_HEIGHT * 0.25, 24000);
    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, []);

  const fetchFinancialNews = async () => {
    try {
      const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&q=finance&language=en`);
      const data = await response.json();

      if (data.status === 'success' && data.results && data.results.length > 0) {
        const mappedNews = data.results.map((art: any, index: number) => ({
          id: (art.article_id || art.link || '') + index,
          title: art.title || 'Market Briefing Update',
          description: art.description || art.content || 'Select full coverage below to inspect analytical reports.',
          source: art.source_name || art.source_id || 'Global News Grid',
          time: art.pubDate ? new Date(art.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Live',
          imageUrl: art.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop',
          url: art.link
        }));
        setBriefings(mappedNews);
      } else {
        setBriefings(BACKUP_FINANCIAL_NEWS);
      }
    } catch {
      setBriefings(BACKUP_FINANCIAL_NEWS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancialNews();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancialNews();
  };

  const handleShare = async (url: string, title: string) => {
    try {
      await Share.share({ message: `${title}\n\nRead more at: ${url}` });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerLoader, { backgroundColor: containerBg }]}>
        <ActivityIndicator size="small" color="#00D09C" />
        <Text style={[styles.loadingLabel, { color: subText }]}>Compiling financial briefings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: containerBg }]}>
      
      {/* 🔮 ABSOLUTE BACKGROUND LAYER ANIMATION */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#1A73E8', top: WINDOW_HEIGHT * 0.2, left: -50, opacity: isDarkMode ? 0.11 : 0.06, transform: [{ translateX: aura1X }, { translateY: aura1Y }] }]} />
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#00D09C', bottom: WINDOW_HEIGHT * 0.15, right: -40, opacity: isDarkMode ? 0.13 : 0.07, transform: [{ translateX: aura2X }, { translateY: aura2Y }] }]} />
      </View>

      <FlatList
        data={briefings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.briefCard, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <View style={styles.metaRow}>
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceText}>{item.source.toUpperCase()}</Text>
                </View>
                <Text style={[styles.timeText, { color: subText }]}>{item.time}</Text>
              </View>

              <Text style={[styles.titleText, { color: primaryText }]} numberOfLines={3}>{item.title}</Text>
              <Text style={[styles.descText, { color: subText }]} numberOfLines={5}>{item.description}</Text>

              <View style={[styles.actionRow, { borderTopColor: glassBorder }]}>
                <TouchableOpacity onPress={() => Linking.openURL(item.url).catch(() => Alert.alert('Error', 'Link faulty.'))} style={styles.actionBtn}>
                  <MaterialIcons name="launch" size={16} color="#00D09C" />
                  <Text style={styles.actionBtnText}>FULL COVERAGE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(item.url, item.title)} style={styles.shareBtn}>
                  <MaterialIcons name="share" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  listContainer: { padding: 16, paddingBottom: 30 },
  ambientBlob: { position: 'absolute', width: WINDOW_WIDTH * 0.75, height: WINDOW_WIDTH * 0.75, borderRadius: (WINDOW_WIDTH * 0.75) / 2, blurRadius: 90, filter: Platform.OS === 'ios' ? undefined : 'blur(70px)' },
  briefCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sourceTag: { backgroundColor: 'rgba(0, 208, 156, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sourceText: { fontSize: 9, color: '#00D09C', fontWeight: '900', letterSpacing: 0.5 },
  timeText: { fontSize: 11, fontWeight: '600' },
  titleText: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  descText: { fontSize: 13, lineHeight: 19, fontWeight: '500', marginBottom: 14 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtnText: { color: '#00D09C', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  shareBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8 }
});