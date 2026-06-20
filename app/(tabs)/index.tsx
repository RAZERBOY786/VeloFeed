// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Dimensions, Share, Linking, Alert, Modal, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../_layout';
import { Category, Article } from '../_types';
import { fetchLiveNews } from '../_newsApi';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const CATEGORIES: ('all' | Category)[] = ['all', 'politics', 'sports', 'technology', 'entertainment', 'business', 'health'];

export default function FeedScreen() {
  const { isDarkMode, lang } = useApp();
  const [activeCat, setActiveCat] = useState<'all' | Category>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Pull-to-refresh tracking state

  const [slideshowItems, setSlideshowItems] = useState<Article[]>([]);
  const [listItems, setListItems] = useState<Article[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [infiniteLoading, setInfiniteLoading] = useState<boolean>(false);
  
  // Modal & Audio states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isReadingAll, setIsReadingAll] = useState<boolean>(false);

  const slideScrollRef = useRef<ScrollView>(null);
  const slideTimer = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Refs used to bypass closures during native continuous voice callbacks
  const readingQueueRef = useRef<Article[]>([]);
  const currentQueueIndexRef = useRef<number>(0);
  const isReadingAllRef = useRef<boolean>(false);

  // Ambient Background Aura Animation Vectors
  const aura1X = useRef(new Animated.Value(0)).current;
  const aura1Y = useRef(new Animated.Value(0)).current;
  const aura2X = useRef(new Animated.Value(0)).current;
  const aura2Y = useRef(new Animated.Value(0)).current;

  // Infinite looping driver loop for the VeloFeed background aura engine
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

    const loop1 = createAuraLoop(aura1X, aura1Y, WINDOW_WIDTH * 0.4, WINDOW_HEIGHT * 0.25, 22000);
    const loop2 = createAuraLoop(aura2X, aura2Y, -WINDOW_WIDTH * 0.35, -WINDOW_HEIGHT * 0.2, 26000);

    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, []);

  // Centralized data compilation worker loop
  const loadIncomingNews = async (forceRefresh = false) => {
    if (!forceRefresh) setLoading(true);
    fadeAnim.setValue(0);
    setCurrentSlideIndex(0);
    
    // Stop all active audio streams when refreshing or swapping channels
    Speech.stop();
    setIsSpeaking(false);
    setIsReadingAll(false);
    isReadingAllRef.current = false;
    
    if (slideTimer.current) clearInterval(slideTimer.current);

    let aggregatedNews: Article[] = [];

    if (activeCat === 'all') {
      try {
        const coreCategories: Category[] = ['politics', 'sports', 'technology', 'entertainment', 'business', 'health'];
        const multiFetchResults = await Promise.all(
          coreCategories.map(cat => fetchLiveNews(cat, lang))
        );
        aggregatedNews = multiFetchResults.flat();
        aggregatedNews.sort(() => 0.5 - Math.random());
      } catch (err) {
        console.error("Global compilation failure:", err);
      }
    } else {
      aggregatedNews = await fetchLiveNews(activeCat, lang);
    }

    setSlideshowItems(aggregatedNews.slice(0, 5));
    setListItems(aggregatedNews.slice(5));
    setLoading(false);
    setIsRefreshing(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // Trigger content pull on category/language structural updates
  useEffect(() => {
    loadIncomingNews(false);
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [activeCat, lang]);

  // Pull-To-Refresh Dispatch Controller
  const handleOnPullRefresh = async () => {
    setIsRefreshing(true);
    await loadIncomingNews(true);
  };

  useEffect(() => {
    if (slideshowItems.length > 0 && !loading) {
      slideTimer.current = setInterval(() => {
        setCurrentSlideIndex((prevIndex) => {
          const nextIndex = prevIndex === slideshowItems.length - 1 ? 0 : prevIndex + 1;
          slideScrollRef.current?.scrollTo({
            x: nextIndex * (WINDOW_WIDTH - 32),
            animated: true
          });
          return nextIndex;
        });
      }, 5000);
    }
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [slideshowItems, loading]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // 🔄 Automated Local Loop Generator Engine for Unlimited Scrolling Dynamics
  const handleLoadMoreLocalUpdates = () => {
    if (infiniteLoading || listItems.length === 0) return;

    setInfiniteLoading(true);
    setTimeout(() => {
      const clonedLoopBatch = listItems.map((article, idx) => ({
        ...article,
        id: `${article.id}_loop_${Date.now()}_${idx}`
      }));
      
      setListItems(prevItems => [...prevItems, ...clonedLoopBatch]);
      setInfiniteLoading(false);
    }, 800);
  };

  // 🎙️ Speech Engine 1: Single Article Summary Reader 
  const toggleSpeechAssistant = (article: Article) => {
    if (isSpeaking || isReadingAll) {
      Speech.stop();
      setIsSpeaking(false);
      setIsReadingAll(false);
      isReadingAllRef.current = false;
    } else {
      setIsSpeaking(true);
      const speechText = `${article.title}. ${article.description || ''}`;
      
      Speech.speak(speechText, {
        language: lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : 'en',
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => { setIsSpeaking(false); }
      });
    }
  };

  // 🎙️ Core Recursive Queue Iterator Engine
  const executeQueueSpeakingSequence = () => {
    if (!isReadingAllRef.current) return;

    if (currentQueueIndexRef.current >= readingQueueRef.current.length) {
      setIsReadingAll(false);
      isReadingAllRef.current = false;
      Speech.speak("Briefing sequence complete.", { language: lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : 'en', rate: 0.95 });
      return;
    }

    const targetArticle = readingQueueRef.current[currentQueueIndexRef.current];
    const contextualTransition = currentQueueIndexRef.current === 0 
      ? "Reading today's top headlines. " 
      : "Next headline. ";

    const pureCleanHeadlineText = `${contextualTransition}${targetArticle.title}.`;

    Speech.speak(pureCleanHeadlineText, {
      language: lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : 'en',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => {
        currentQueueIndexRef.current += 1;
        executeQueueSpeakingSequence();
      },
      onError: () => {
        setIsReadingAll(false);
        isReadingAllRef.current = false;
      }
    });
  };

  // 🎙️ Speech Engine 2: Master Floating Audio FAB Button (Clean continuous looping titles)
  const toggleReadTodayHeadlines = () => {
    if (isReadingAll || isSpeaking) {
      Speech.stop();
      setIsReadingAll(false);
      isReadingAllRef.current = false;
      setIsSpeaking(false);
    } else {
      const itemsToProcess = slideshowItems.slice(0, 5);
      if (itemsToProcess.length === 0) return;

      readingQueueRef.current = itemsToProcess;
      currentQueueIndexRef.current = 0;
      setIsReadingAll(true);
      isReadingAllRef.current = true;

      executeQueueSpeakingSequence();
    }
  };

  const handleShare = async (url: string, title: string) => {
    try {
      await Share.share({ message: `${title}\n\nRead full coverage at: ${url}` });
    } catch (error) {
      console.error(error);
    }
  };

  const openArticleDetails = (article: Article) => {
    if (isReadingAll) {
      Speech.stop();
      setIsReadingAll(false);
      isReadingAllRef.current = false;
    }
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const renderListCard = ({ item }: { item: Article }) => {
    const cardBg = isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)';
    const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    return (
      <TouchableOpacity 
        onPress={() => openArticleDetails(item)}
        activeOpacity={0.85}
        style={[styles.googleCard, { backgroundColor: cardBg, borderColor, marginBottom: 12 }]}
      >
        <View style={styles.rowFlex}>
          <View style={styles.rowTextFrame}>
            <View style={styles.tagInlineRow}>
              <Text style={[styles.sourceText, { color: isDarkMode ? '#38BDF8' : '#1A73E8' }]}>{item.source.name}</Text>
              <Text style={styles.categoryDivider}> • </Text>
              <Text style={[styles.inlineCategoryTag, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>{item.category.toUpperCase()}</Text>
            </View>
            <Text style={[styles.storyTitle, { color: isDarkMode ? '#E2E8F0' : '#202124' }]} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.timeText}>{item.publishedAt}</Text>
          </View>
          {item.urlToImage && (
            <Image 
              source={{ uri: item.urlToImage }} 
              style={styles.rowThumbnail} 
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: isDarkMode ? '#0F172A' : '#F8F9FA' }]}>
      
      {/* 🔮 FIXED AMBIENT BACKGROUND LAYER ANIMATION BLOCKS */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#00D09C', top: WINDOW_HEIGHT * 0.15, left: -40, opacity: isDarkMode ? 0.12 : 0.08, transform: [{ translateX: aura1X }, { translateY: aura1Y }] }]} />
        <Animated.View style={[styles.ambientBlob, { backgroundColor: '#1A73E8', bottom: WINDOW_HEIGHT * 0.2, right: -60, opacity: isDarkMode ? 0.14 : 0.07, transform: [{ translateX: aura2X }, { translateY: aura2Y }] }]} />
      </View>
      
      {/* Header Tabs Navigation */}
      <View style={[styles.topicsContainer, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)', borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCat === cat;
            return (
              <TouchableOpacity key={cat} style={styles.topicTab} onPress={() => setActiveCat(cat)}>
                <Text style={[
                  styles.topicLabelText, 
                  { color: isActive ? (isDarkMode ? '#38BDF8' : '#1A73E8') : (isDarkMode ? '#94A3B8' : '#5F6368') },
                  isActive && styles.topicLabelActive
                ]}>
                  {cat.toUpperCase()}
                </Text>
                {isActive && <View style={[styles.activeIndicatorLine, { backgroundColor: isDarkMode ? '#38BDF8' : '#1A73E8' }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerSpinner}>
          <ActivityIndicator size="small" color="#1A73E8" />
          <Text style={[styles.aggregatingText, { color: isDarkMode ? '#94A3B8' : '#70757A' }]}>Switching regional archives...</Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item, index) => item.id + "_" + index} 
          renderItem={renderListCard}
          contentContainerStyle={styles.feedPadding}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMoreLocalUpdates} 
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleOnPullRefresh}
              colors={['#00D09C', '#1A73E8']} // Android color array steps
              tintColor={isDarkMode ? '#00D09C' : '#1A73E8'} // iOS style spinner accent mapping
            />
          }
          ListFooterComponent={
            infiniteLoading ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#00D09C" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerSpinner}>
              <Text style={{ color: '#70757A', fontWeight: 'bold' }}>No channel updates found for this region.</Text>
            </View>
          }
          ListHeaderComponent={
            slideshowItems.length > 0 ? (
              <View style={styles.slideshowWrapper}>
                
                <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#202124' }]}>
                  {activeCat === 'all' ? 'REGIONAL SPOTLIGHT FEED' : `SPOTLIGHT: ${activeCat.toUpperCase()}`}
                </Text>

                <ScrollView
                  ref={slideScrollRef}
                  horizontal
                  pagingEnabled
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={false}
                >
                  {slideshowItems.map((slide) => {
                    const slideCardBg = isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)';
                    const slideBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                    return (
                      <TouchableOpacity 
                        key={slide.id}
                        style={[styles.slideShowCard, { backgroundColor: slideCardBg, borderColor: slideBorder }]}
                        onPress={() => openArticleDetails(slide)}
                        activeOpacity={0.9}
                      >
                        {slide.urlToImage && (
                          <Image source={{ uri: slide.urlToImage }} style={styles.slideImage} resizeMode="cover" />
                        )}
                        <View style={styles.slideBody}>
                          <View style={styles.tagInlineRow}>
                            <Text style={[styles.sourceText, { color: '#1A73E8' }]}>{slide.source.name.toUpperCase()}</Text>
                            <Text style={styles.categoryDivider}>•</Text>
                            <Text style={styles.slideCategoryBadge}>{slide.category.toUpperCase()}</Text>
                          </View>
                          <Text style={[styles.slideTitle, { color: isDarkMode ? '#F8FAFC' : '#202124' }]} numberOfLines={2}>{slide.title}</Text>
                          <Text style={styles.timeText}>{slide.publishedAt}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.bulletRow}>
                  {slideshowItems.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.bulletDot, 
                        { backgroundColor: i === currentSlideIndex ? '#1A73E8' : (isDarkMode ? '#475569' : '#C4C7C5') }
                      ]} 
                    />
                  ))}
                </View>
                
                <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#202124', marginTop: 20, marginBottom: 4 }]}>
                  More Localized Updates
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* 🎙️ FIXED BOTTOM-RIGHT FLOATING ACTION BUTTON (FAB) */}
      {!loading && slideshowItems.length > 0 && (
        <TouchableOpacity 
          onPress={toggleReadTodayHeadlines}
          activeOpacity={0.85}
          style={[
            styles.floatingAudioFab, 
            { backgroundColor: isReadingAll ? '#FF5353' : '#00D09C' }
          ]}
        >
          <MaterialIcons name={isReadingAll ? "stop" : "volume-up"} size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* 📥 FULL INFO POPUP MODAL SCREEN DRAWER */}
      {selectedArticle && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlayContainer}>
            <View style={[styles.modalContentBox, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}>
              
              <View style={[styles.modalHeaderRow, { borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <View style={styles.modalTagRow}>
                  <Text style={[styles.modalSourceText, { color: '#1A73E8' }]}>{selectedArticle.source.name.toUpperCase()}</Text>
                  <Text style={{ color: '#64748B' }}> • </Text>
                  <Text style={styles.modalCategoryText}>{selectedArticle.category.toUpperCase()}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => toggleSpeechAssistant(selectedArticle)}
                    style={[styles.closeIconFrame, isSpeaking && { backgroundColor: 'rgba(0, 208, 156, 0.15)' }]}
                  >
                    <MaterialIcons 
                      name={isSpeaking ? "volume-up" : "volume-mute"} 
                      size={20} 
                      color={isSpeaking ? "#00D09C" : (isDarkMode ? '#F8FAFC' : '#1E293B')} 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconFrame}>
                    <MaterialIcons name="close" size={22} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollFrame}>
                {selectedArticle.urlToImage && (
                  <Image source={{ uri: selectedArticle.urlToImage }} style={styles.modalImageHero} resizeMode="contain" />
                )}
                
                <Text style={[styles.modalTitleText, { color: isDarkMode ? '#F8FAFC' : '#202124' }]}>
                  {selectedArticle.title}
                </Text>
                
                <Text style={styles.modalTimeText}>Published: {selectedArticle.publishedAt}</Text>
                
                <Text style={[styles.modalDescText, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                  {selectedArticle.description || "No further baseline content summaries provided by the regional media publisher desk."}
                </Text>
              </ScrollView>

              <View style={[styles.modalFooterBar, { borderTopColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL(selectedArticle.url).catch(() => Alert.alert('Throttled', 'Cannot load URL source link.'))} 
                  style={styles.fullCoverageCapsule}
                >
                  <MaterialIcons name="fullscreen" size={22} color="#FFFFFF" />
                  <Text style={styles.fullCoverageBtnText}>FULL COVERAGE</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleShare(selectedArticle.url, selectedArticle.title)}
                  style={[styles.modalShareBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                >
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
  centerSpinner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 40 },
  aggregatingText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  feedPadding: { padding: 16, paddingBottom: 24 },
  ambientBlob: { position: 'absolute', width: WINDOW_WIDTH * 0.75, height: WINDOW_WIDTH * 0.75, borderRadius: (WINDOW_WIDTH * 0.75) / 2, opacity: 0.1 },
  topicsContainer: { height: 48, justifyContent: 'center', borderBottomWidth: 1 },
  topicTab: { height: '100%', justifyContent: 'center', marginRight: 22, position: 'relative' },
  topicLabelText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  topicLabelActive: { fontWeight: '800' },
  activeIndicatorLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 1.5 },
  floatingAudioFab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6, zIndex: 99 },
  slideshowWrapper: { marginBottom: 16 },
  sectionHeading: { fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 0.8, color: '#70757A' },
  slideShowCard: { width: WINDOW_WIDTH - 32, height: 245, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  slideImage: { width: '100%', height: 135, backgroundColor: '#E2E8F0' },
  slideBody: { padding: 12 },
  slideTitle: { fontSize: 14, fontWeight: '600', lineHeight: 22, marginTop: 4, marginBottom: 2 },
  slideCategoryBadge: { fontSize: 10, color: '#70757A', fontWeight: 'bold', letterSpacing: 0.5 },
  bulletRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3 },
  googleCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  rowFlex: { flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
  rowTextFrame: { flex: 1, paddingRight: 12 },
  tagInlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  sourceText: { fontSize: 11, fontWeight: '700' },
  categoryDivider: { fontSize: 11, color: '#70757A' },
  inlineCategoryTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  storyTitle: { fontSize: 14, fontWeight: '500', lineHeight: 22 },
  timeText: { fontSize: 11, color: '#70757A', marginTop: 4 },
  rowThumbnail: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E2E8F0' },
  modalOverlayContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalContentBox: { height: WINDOW_HEIGHT * 0.82, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  modalHeaderRow: { height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1 },
  modalTagRow: { flexDirection: 'row', alignItems: 'center' },
  modalSourceText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  modalCategoryText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  closeIconFrame: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
  modalScrollFrame: { padding: 20 },
  modalImageHero: { width: '100%', height: 220, borderRadius: 20, marginBottom: 16, backgroundColor: '#E2E8F0' },
  modalTitleText: { fontSize: 19, fontWeight: '800', lineHeight: 26, letterSpacing: -0.4, marginBottom: 8 },
  modalTimeText: { fontSize: 12, color: '#64748B', marginBottom: 16, fontWeight: '500' },
  modalDescText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  modalFooterBar: { height: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 1, gap: 12, paddingBottom: 10 },
  fullCoverageCapsule: { flex: 1, height: 48, backgroundColor: '#00D09C', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  fullCoverageBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  modalShareBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }
});