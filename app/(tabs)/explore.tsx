// app/(tabs)/explore.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Dimensions, Share, Linking, Alert, Modal, Platform, RefreshControl } from 'react-native';
import { useApp } from '../_layout';
import { Category, Article } from '../_types';
import { fetchLiveNews } from '../_newsApi';
import { MaterialIcons } from '@expo/vector-icons';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

interface FlashAlert {
  id: string;
  headline: string;
  urgency: 'CRITICAL' | 'VOLATILITY RISK' | 'INFO';
  timestamp: string;
  relatedTicker: string;
}

const STATIC_FLASH_ALERTS: FlashAlert[] = [
  { id: 'f1', headline: 'Federal Reserve announces unexpected emergency liquidity window deployment ahead of opening bell.', urgency: 'CRITICAL', timestamp: '2m ago', relatedTicker: 'USA' },
  { id: 'f2', headline: 'Semiconductor supply routes bottleneck as regional custom clearances introduce mandatory validation protocols.', urgency: 'VOLATILITY RISK', timestamp: '14m ago', relatedTicker: 'AAPL' },
  { id: 'f3', headline: 'Reserve Bank of India reports macro industrial expansion index values outperforming multi-quarter metrics.', urgency: 'INFO', timestamp: '28m ago', relatedTicker: 'RELIANCE' },
  { id: 'f4', headline: 'Global cloud infrastructure providers report network optimization patches completed across localized data centers.', urgency: 'INFO', timestamp: '45m ago', relatedTicker: 'MSFT' },
  { id: 'f5', headline: 'Automotive conglomerate updates long-range EV production guidance targets downward citing component changes.', urgency: 'VOLATILITY RISK', timestamp: '1h ago', relatedTicker: '7203' }
];

const CORRELATION_TICKERS = ['ALL', 'AAPL', 'MSFT', 'RELIANCE', 'USA', '7203'];

export default function IntelligenceDashboard() {
  const { isDarkMode, lang } = useApp();
  const [selectedTicker, setSelectedTicker] = useState<string>('ALL');
  const [displayAlerts, setDisplayAlerts] = useState<FlashAlert[]>(STATIC_FLASH_ALERTS);
  
  // Dynamic Live News Stream States
  const [correlatedNews, setCorrelatedNews] = useState<Article[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [infiniteLoading, setInfiniteLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal deep-dive detail view states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Ambient Background Aura Animation Vectors
  const aura1X = useRef(new Animated.Value(0)).current;
  const aura1Y = useRef(new Animated.Value(0)).current;
  const aura2X = useRef(new Animated.Value(0)).current;
  const aura2Y = useRef(new Animated.Value(0)).current;

  const containerBg = isDarkMode ? '#0F172A' : '#F8F9FA';
  const glassCardBg = isDarkMode ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.75)';
  const glassBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const primaryText = isDarkMode ? '#202124' : '#202124';
  const subText = isDarkMode ? '#94A3B8' : '#64748B';

  // Background Looping Light Engine
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

    const loop1 = createAuraLoop(aura1X, aura1Y, WINDOW_WIDTH * 0.35, WINDOW_HEIGHT * 0.2, 24000);
    const loop2 = createAuraLoop(aura2X, aura2Y, -WINDOW_WIDTH * 0.4, -WINDOW_HEIGHT * 0.25, 20000);
    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, []);

  const fetchCorrelatedData = async (forceRefresh = false) => {
    if (!forceRefresh) setNewsLoading(true);
    
    // Filter Top Flash Alerts Row
    if (selectedTicker === 'ALL') {
      setDisplayAlerts(STATIC_FLASH_ALERTS);
    } else {
      setDisplayAlerts(STATIC_FLASH_ALERTS.filter(alert => alert.relatedTicker === selectedTicker));
    }

    try {
      let fetchedArticles: Article[] = [];
      
      if (selectedTicker === 'ALL') {
        const coreSectors: Category[] = ['business', 'technology', 'politics'];
        const multiFetch = await Promise.all(coreSectors.map(cat => fetchLiveNews(cat, lang)));
        fetchedArticles = multiFetch.flat().sort(() => 0.5 - Math.random());
      } else {
        let targetCategory: Category = 'business';
        if (selectedTicker === 'AAPL' || selectedTicker === 'MSFT') {
          targetCategory = 'technology';
        } else if (selectedTicker === 'USA') {
          targetCategory = 'politics';
        }
        
        fetchedArticles = await fetchLiveNews(targetCategory, lang);
        if (!fetchedArticles || fetchedArticles.length === 0) {
          fetchedArticles = await fetchLiveNews('technology', lang);
        }
      }
      setCorrelatedNews(fetchedArticles);
    } catch (err) {
      console.error("Explore mapping failure:", err);
    } finally {
      setNewsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCorrelatedData(false);
  }, [selectedTicker, lang]);

  const handleOnPullRefresh = async () => {
    setIsRefreshing(true);
    await fetchCorrelatedData(true);
  };

  // 🔄 Automated Local Loop Generator Engine for Unlimited Scrolling Dynamics
  const handleLoadMoreExploreNews = () => {
    if (infiniteLoading || correlatedNews.length === 0) return;

    setInfiniteLoading(true);
    setTimeout(() => {
      const loopExtensionBatch = correlatedNews.map((article, idx) => ({
        ...article,
        id: `${article.id}_explore_loop_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`
      }));
      setCorrelatedNews(prev => [...prev, ...loopExtensionBatch]);
      setInfiniteLoading(false);
    }, 800);
  };

  const handleShare = async (url: string, title: string) => {
    try {
      await Share.share({ message: `${title}\n\nRead structural breakdown at: ${url}` });
    } catch (error) {
      console.error(error);
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return { bg: 'rgba(255, 83, 83, 0.12)', text: '#FF5353', border: 'rgba(255, 83, 83, 0.2)' };
      case 'VOLATILITY RISK':
        return { bg: 'rgba(241, 196, 15, 0.12)', text: '#F1C40F', border: 'rgba(241, 196, 15, 0.2)' };
      default:
        return { bg: 'rgba(0, 208, 156, 0.12)', text: '#00D09C', border: 'rgba(0, 208, 156, 0.2)' };
    }
  };

  const renderNewsCard = ({ item, index }: { item: Article; index: number }) => {
    const cardBg = isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)';
    const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    return (
      <TouchableOpacity 
        onPress={() => { setSelectedArticle(item); setModalVisible(true); }}
        activeOpacity={0.85}
        style={[styles.newsCard, { backgroundColor: cardBg, borderColor, marginBottom: 12 }]}
      >
        <View style={styles.rowFlex}>
          <View style={styles.rowTextFrame}>
            <View style={styles.tagInlineRow}>
              <Text style={[styles.sourceText, { color: isDarkMode ? '#38BDF8' : '#1A73E8' }]}>{item.source.name}</Text>
              <Text style={styles.categoryDivider}> • </Text>
              <Text style={styles.inlineCategoryTag}>{item.category.toUpperCase()}</Text>
            </View>
            <Text style={[styles.storyTitle, { color: isDarkMode ? '#E2E8F0' : '#202124' }]} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.timeText}>{item.publishedAt}</Text>
          </View>
          {item.urlToImage && (
            <Image source={{ uri: item.urlToImage }} style={styles.rowThumbnail} resizeMode="cover" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: containerBg }]}>
      {/* 🔮 FIXED AMBIENT BACKGROUND LAYER */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#1A73E8', top: WINDOW_HEIGHT * 0.2, left: -40, opacity: isDarkMode ? 0.12 : 0.07, transform: [{ translateX: aura1X }, { translateY: aura1Y }] }]} />
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#00D09C', bottom: WINDOW_HEIGHT * 0.2, right: -50, opacity: isDarkMode ? 0.14 : 0.06, transform: [{ translateX: aura2X }, { translateY: aura2Y }] }]} />
      </View>

      {/* Ticker Selector - The Correlation Matrix Filter Dashboard Element */}
      <View style={[styles.matrixHeader, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
        <Text style={[styles.matrixHeadingText, { color: isDarkMode ? '#F8FAFC' : '#202124' }]}>ASSET CORRELATION FILTER MATRIX</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerScroll}>
          {CORRELATION_TICKERS.map((ticker) => {
            const isTarget = selectedTicker === ticker;
            return (
              <TouchableOpacity 
                key={ticker} 
                onPress={() => setSelectedTicker(ticker)}
                style={[styles.tickerPill, isTarget && { backgroundColor: '#00D09C', borderColor: '#00D09C' }, { borderColor: glassBorder }]}
              >
                <Text style={[styles.tickerPillText, { color: isTarget ? '#FFFFFF' : subText }]}>{ticker}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Stream FlatList Element */}
      <FlatList
        data={correlatedNews}
        keyExtractor={(item, idx) => item.id + "_" + idx} 
        renderItem={renderNewsCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMoreExploreNews}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleOnPullRefresh}
            colors={['#00D09C', '#1A73E8']}
            tintColor={isDarkMode ? '#00D09C' : '#1A73E8'}
          />
        }
        ListFooterComponent={
          infiniteLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#00D09C" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            {/* 1. Breaking Flash Alert Subsections */}
            <Text style={[styles.feedTitle, { color: subText }]}>LIVE FLASH MARKET ALERTS</Text>
            {displayAlerts.map((alert) => {
              const themeBadge = getUrgencyStyles(alert.urgency);
              return (
                <View key={alert.id} style={[styles.alertCard, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.urgencyBadge, { backgroundColor: themeBadge.bg, borderColor: themeBadge.border }]}>
                      <Text style={[styles.urgencyText, { color: themeBadge.text }]}>{alert.urgency}</Text>
                    </View>
                    <Text style={[styles.timeLabel, { color: subText }]}>{alert.timestamp}</Text>
                  </View>
                  <Text style={[styles.headlineText, { color: isDarkMode ? '#F8FAFC' : '#202124' }]}>{alert.headline}</Text>
                </View>
              );
            })}

            {/* 2. Headline Divider for Live Correlated Streams */}
            <Text style={[styles.feedTitle, { color: subText, marginTop: 18 }]}>
              {selectedTicker === 'ALL' ? 'CORRELATED GLOBAL DESK WIRE' : `CORRELATED MATRICES: ${selectedTicker}`}
            </Text>

            {newsLoading && (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#1A73E8" />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !newsLoading ? (
            <View style={styles.centerSpinner}>
              <MaterialIcons name="grid-off" size={32} color={subText} />
              <Text style={{ color: subText, fontWeight: '700', marginTop: 8, fontSize: 13, textAlign: 'center' }}>No recent wire signals matching this target quadrant layout matrix link.</Text>
            </View>
          ) : null
        }
      />

      {/* 📥 IN-DEPTH DETAIL POPUP MODAL SCREEN DRAWER */}
      {selectedArticle && (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlayContainer}>
            <View style={[styles.modalContentBox, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}>
              <View style={[styles.modalHeaderRow, { borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <View style={styles.modalTagRow}>
                  <Text style={[styles.modalSourceText, { color: '#1A73E8' }]}>{selectedArticle.source.name.toUpperCase()}</Text>
                  <Text style={{ color: '#64748B' }}> • </Text>
                  <Text style={styles.modalCategoryText}>{selectedArticle.category.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconFrame}>
                  <MaterialIcons name="close" size={22} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollFrame}>
                {selectedArticle.urlToImage && (
                  <Image source={{ uri: selectedArticle.urlToImage }} style={styles.modalImageHero} resizeMode="contain" />
                )}
                <Text style={[styles.modalTitleText, { color: isDarkMode ? '#F8FAFC' : '#202124' }]}>{selectedArticle.title}</Text>
                <Text style={styles.modalTimeText}>Published: {selectedArticle.publishedAt}</Text>
                <Text style={[styles.modalDescText, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                  {selectedArticle.description || "No further baseline content summaries provided by the regional media publisher desk."}
                </Text>
              </ScrollView>

              <View style={[styles.modalFooterBar, { borderTopColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <TouchableOpacity onPress={() => Linking.openURL(selectedArticle.url).catch(() => Alert.alert('Error', 'Cannot load URL source link.'))} style={styles.fullCoverageCapsule}>
                  <MaterialIcons name="fullscreen" size={22} color="#FFFFFF" />
                  <Text style={styles.fullCoverageBtnText}>FULL COVERAGE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(selectedArticle.url, selectedArticle.title)} style={[styles.modalShareBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <MaterialIcons name="share" size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  ambientBlob: { position: 'absolute', width: WINDOW_WIDTH * 0.75, height: WINDOW_WIDTH * 0.75, borderRadius: (WINDOW_WIDTH * 0.75) / 2, opacity: 0.1 },
  matrixHeader: { padding: 16, borderBottomWidth: 1 },
  matrixHeadingText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6, marginBottom: 12 },
  tickerScroll: { gap: 8, paddingRight: 16 },
  tickerPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  tickerPillText: { fontSize: 11, fontWeight: '700' },
  listContainer: { padding: 16, paddingBottom: 24 },
  feedTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 12, marginTop: 4 },
  alertCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 0.5 },
  urgencyText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  timeLabel: { fontSize: 11, fontWeight: '600' },
  headlineText: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  newsCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  rowFlex: { flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
  rowTextFrame: { flex: 1, paddingRight: 12 },
  tagInlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  sourceText: { fontSize: 11, fontWeight: '700' },
  categoryDivider: { fontSize: 11, color: '#70757A' },
  inlineCategoryTag: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.4 },
  storyTitle: { fontSize: 14, fontWeight: '500', lineHeight: 21 },
  timeText: { fontSize: 11, color: '#70757A', marginTop: 4 },
  rowThumbnail: { width: 75, height: 75, borderRadius: 12, backgroundColor: '#E2E8F0' },
  centerSpinner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  modalOverlayContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalContentBox: { height: WINDOW_HEIGHT * 0.82, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  modalHeaderRow: { height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1 },
  modalTagRow: { flexDirection: 'row', alignItems: 'center' },
  modalSourceText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  modalCategoryText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  closeIconFrame: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
  modalScrollFrame: { padding: 20 },
  modalImageHero: { width: '100%', height: 210, borderRadius: 20, marginBottom: 16, backgroundColor: '#E2E8F0' },
  modalTitleText: { fontSize: 19, fontWeight: '800', lineHeight: 26, letterSpacing: -0.4, marginBottom: 8 },
  modalTimeText: { fontSize: 12, color: '#64748B', marginBottom: 16, fontWeight: '500' },
  modalDescText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  modalFooterBar: { height: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 1, gap: 12, paddingBottom: 10 },
  fullCoverageCapsule: { flex: 1, height: 48, backgroundColor: '#00D09C', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  fullCoverageBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  modalShareBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }
});