// app/(tabs)/market.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, Dimensions, Platform, Alert } from 'react-native';
import { useApp } from '../_layout';
import Svg, { Path, Rect, Line, LinearGradient, Stop, Defs } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type CountryKey = 'INDIA' | 'USA' | 'UK' | 'JAPAN' | 'GERMANY' | 'CANADA' | 'AUSTRALIA' | 'FRANCE' | 'CHINA' | 'BRAZIL' | 'UAE' | 'SINGAPORE';
type TimeFilter = '1D' | '1M' | '1Y';

interface IndexTracker {
  name: string;
  value: string;
  delta: string;
  positive: boolean;
  paths: Record<TimeFilter, { line: string; area: string }>;
}

interface CompanyAsset {
  ticker: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  linePath: string;
  ceo: string;
  revenue: string;
  eps: string;
  aiPrediction: string;
}

const SEED_COMPANIES: Record<CountryKey, Array<{ t: string; n: string; cur: string; p: number; ceo: string; rev: string; eps: string }>> = {
  INDIA: [
    { t: 'RELIANCE', n: 'Reliance Industries Ltd.', cur: '₹', p: 2450.30, ceo: 'Mukesh Ambani', rev: '₹9.74T', eps: '₹94.50' },
    { t: 'TCS', n: 'Tata Consultancy Services', cur: '₹', p: 3820.15, ceo: 'K. Krithivasan', rev: '₹2.41T', eps: '₹124.20' },
    { t: 'HDFCBANK', n: 'HDFC Bank Limited', cur: '₹', p: 1610.45, ceo: 'Sashidhar Jagdishan', rev: '₹2.12T', eps: '₹68.10' }
  ],
  USA: [
    { t: 'AAPL', n: 'Apple Inc.', cur: '$', p: 182.40, ceo: 'Tim Cook', rev: '$385.7B', eps: '$6.15' },
    { t: 'MSFT', n: 'Microsoft Corporation', cur: '$', p: 415.60, ceo: 'Satya Nadella', rev: '$227.5B', eps: '$11.06' }
  ],
  UK: [{ t: 'AZN', n: 'AstraZeneca PLC', cur: '£', p: 11500, ceo: 'Pascal Soriot', rev: '$45.8B', eps: '$3.60' }],
  JAPAN: [{ t: '7203', n: 'Toyota Motor Corp.', cur: '¥', p: 3410, ceo: 'Koji Sato', rev: '¥43.0T', eps: '¥240.5' }],
  GERMANY: [{ t: 'SAP', n: 'SAP SE', cur: '€', p: 172.40, ceo: 'Christian Klein', rev: '€31.2B', eps: '€4.80' }],
  CANADA: [{ t: 'RY', n: 'Royal Bank of Canada', cur: 'C$', p: 138.20, ceo: 'Dave McKay', rev: 'C$52.4B', eps: 'C$11.10' }],
  AUSTRALIA: [{ t: 'BHP', n: 'BHP Group Limited', cur: 'A$', p: 43.10, ceo: 'Mike Henry', rev: '$53.8B', eps: '$2.45' }],
  FRANCE: [{ t: 'MC', n: 'LVMH Moët Hennessy', cur: '€', p: 785.00, ceo: 'Bernard Arnault', rev: '€86.2B', eps: '€30.11' }],
  CHINA: [{ t: '9988', n: 'Alibaba Group Holding', cur: 'HK$', p: 74.20, ceo: 'Eddie Wu', rev: '¥941.1B', eps: '¥6.40' }],
  BRAZIL: [{ t: 'VALE3', n: 'Vale SA', cur: 'R$', p: 62.40, ceo: 'Eduardo Bartolomeo', rev: '$41.8B', eps: '$1.65' }],
  UAE: [{ t: 'EMAAR', n: 'Emaar Properties PJSC', cur: 'AED ', p: 7.95, ceo: 'Amit Jain', rev: 'AED 26.7B', eps: 'AED 0.92' }],
  SINGAPORE: [{ t: 'D05', n: 'DBS Group Holdings Ltd', cur: 'S$', p: 35.85, ceo: 'Piyush Gupta', rev: 'S$20.1B', eps: 'S$3.42' }]
};

const BASE_INDICES: Record<CountryKey, IndexTracker[]> = {
  INDIA: [
    { name: 'NIFTY 50', value: '24,013.10', delta: '+0.64%', positive: true, paths: { '1D': { line: "M0,70 L50,55 L100,65 L150,40 L200,42 L250,22 L300,10", area: "M0,70 L50,55 L100,65 L150,40 L200,42 L250,22 L300,10 L300,90 L0,90 Z" }, '1M': { line: "M0,50 L50,42 L100,30 L150,35 L200,20 L250,18 L300,5", area: "M0,50 L50,42 L100,30 L150,35 L200,20 L250,18 L300,5 L300,90 L0,90 Z" }, '1Y': { line: "M0,80 L50,65 L100,50 L150,45 L200,28 L250,12 L300,2", area: "M0,80 L50,65 L100,50 L150,45 L200,28 L250,12 L300,2 L300,90 L0,90 Z" } } },
    { name: 'SENSEX', value: '76,802.90', delta: '+0.58%', positive: true, paths: { '1D': { line: "M0,75 L60,60 L120,68 L180,45 L240,30 L300,15", area: "M0,75 L60,60 L120,68 L180,45 L240,30 L300,15 L300,90 L0,90 Z" }, '1M': { line: "M0,60 L60,45 L120,50 L180,25 L240,22 L300,10", area: "M0,60 L60,45 L120,50 L180,25 L240,22 L300,10 L300,90 L0,90 Z" }, '1Y': { line: "M0,85 L60,70 L120,55 L180,35 L240,18 L300,5", area: "M0,85 L60,70 L120,55 L180,35 L240,18 L300,5 L300,90 L0,90 Z" } } }
  ],
  USA: [
    { name: 'S&P 500', value: '5,420.22', delta: '+1.14%', positive: true, paths: { '1D': { line: "M0,65 L50,58 L100,42 L150,48 L200,30 L250,22 L300,12", area: "M0,65 L50,58 L100,42 L150,48 L200,30 L250,22 L300,12 L300,90 L0,90 Z" }, '1M': { line: "M0,50 L50,58 L100,35 L150,42 L200,22 L250,15 L300,5", area: "M0,50 L50,58 L100,35 L150,42 L200,22 L250,15 L300,5 L300,90 L0,90 Z" }, '1Y': { line: "M0,80 L50,70 L100,55 L150,38 L200,25 L250,18 L300,2", area: "M0,80 L50,70 L100,55 L150,38 L200,25 L250,18 L300,2 L300,90 L0,90 Z" } } },
    { name: 'NASDAQ', value: '17,890.45', delta: '+1.65%', positive: true, paths: { '1D': { line: "M0,70 L60,55 L120,62 L180,38 L240,25 L300,10", area: "M0,70 L60,55 L120,62 L180,38 L240,25 L300,10 L300,90 L0,90 Z" }, '1M': { line: "M0,55 L60,42 L120,48 L180,22 L240,18 L300,5", area: "M0,55 L60,42 L120,48 L180,22 L240,18 L300,5 L300,90 L0,90 Z" }, '1Y': { line: "M0,85 L60,72 L120,58 L180,40 L240,28 L300,2", area: "M0,85 L60,72 L120,58 L180,40 L240,28 L300,2 L300,90 L0,90 Z" } } }
  ],
  UK: [{ name: 'FTSE 100', value: '8,210.40', delta: '+0.42%', positive: true, paths: { '1D': { line: "M0,45 L150,25 L300,10", area: "M0,45 L150,25 L300,10 L300,90 L0,90 Z" }, '1M': { line: "M0,45 L150,25 L300,10", area: "M0,45 L150,25 L300,10 L300,90 L0,90 Z" }, '1Y': { line: "M0,45 L150,25 L300,10", area: "M0,45 L150,25 L300,10 L300,90 L0,90 Z" } } }],
  JAPAN: [{ name: 'NIKKEI 225', value: '38,550.10', delta: '-1.05%', positive: false, paths: { '1D': { line: "M0,10 L150,45 L300,80", area: "M0,10 L150,45 L300,80 L300,90 L0,90 Z" }, '1M': { line: "M0,10 L150,45 L300,80", area: "M0,10 L150,45 L300,80 L300,90 L0,90 Z" }, '1Y': { line: "M0,10 L150,45 L300,80", area: "M0,10 L150,45 L300,80 L300,90 L0,90 Z" } } }],
  GERMANY: [{ name: 'DAX 40', value: '18,120.30', delta: '+0.33%', positive: true, paths: { '1D': { line: "M0,50 L300,20", area: "M0,50 L300,20 L300,90 L0,90 Z" }, '1M': { line: "M0,50 L300,20", area: "M0,50 L300,20 L300,90 L0,90 Z" }, '1Y': { line: "M0,50 L300,20", area: "M0,50 L300,20 L300,90 L0,90 Z" } } }],
  CANADA: [{ name: 'S&P/TSX', value: '22,180.50', delta: '-0.15%', positive: false, paths: { '1D': { line: "M0,20 L300,60", area: "M0,20 L300,60 L300,90 L0,90 Z" }, '1M': { line: "M0,20 L300,60", area: "M0,20 L300,60 L300,90 L0,90 Z" }, '1Y': { line: "M0,20 L300,60", area: "M0,20 L300,60 L300,90 L0,90 Z" } } }],
  AUSTRALIA: [{ name: 'ASX 200', value: '7,750.20', delta: '+0.25%', positive: true, paths: { '1D': { line: "M0,40 L300,15", area: "M0,40 L300,15 L300,90 L0,90 Z" }, '1M': { line: "M0,40 L300,15", area: "M0,40 L300,15 L300,90 L0,90 Z" }, '1Y': { line: "M0,40 L300,15", area: "M0,40 L300,15 L300,90 L0,90 Z" } } }],
  FRANCE: [{ name: 'CAC 40', value: '7,950.15', delta: '+0.12%', positive: true, paths: { '1D': { line: "M0,45 L300,30", area: "M0,45 L300,30 L300,90 L0,90 Z" }, '1M': { line: "M0,45 L300,30", area: "M0,45 L300,30 L300,90 L0,90 Z" }, '1Y': { line: "M0,45 L300,30", area: "M0,45 L300,30 L300,90 L0,90 Z" } } }],
  CHINA: [{ name: 'SHANGHAI COMP', value: '3,025.40', delta: '-0.88%', positive: false, paths: { '1D': { line: "M0,15 L300,70", area: "M0,15 L300,70 L300,90 L0,90 Z" }, '1M': { line: "M0,15 L300,70", area: "M0,15 L300,70 L300,90 L0,90 Z" }, '1Y': { line: "M0,15 L300,70", area: "M0,15 L300,70 L300,90 L0,90 Z" } } }],
  BRAZIL: [{ name: 'IBOVESPA', value: '119,500', delta: '+0.60%', positive: true, paths: { '1D': { line: "M0,55 L300,25", area: "M0,55 L300,25 L300,90 L0,90 Z" }, '1M': { line: "M0,55 L300,25", area: "M0,55 L300,25 L300,90 L0,90 Z" }, '1Y': { line: "M0,55 L300,25", area: "M0,55 L300,25 L300,90 L0,90 Z" } } }],
  UAE: [{ name: 'DFM GENERAL', value: '3,980.20', delta: '+0.44%', positive: true, paths: { '1D': { line: "M0,45 L300,15", area: "M0,45 L300,15 L300,90 L0,90 Z" }, '1M': { line: "M0,45 L300,15", area: "M0,45 L300,15 L300,90 L0,90 Z" }, '1Y': { line: "M0,45 L300,15", area: "M0,45 L300,15 L300,90 L0,90 Z" } } }],
  SINGAPORE: [{ name: 'STI INDEX', value: '3,310.10', delta: '-0.20%', positive: false, paths: { '1D': { line: "M0,25 L300,55", area: "M0,25 L300,55 L300,90 L0,90 Z" }, '1M': { line: "M0,25 L300,55", area: "M0,25 L300,55 L300,90 L0,90 Z" }, '1Y': { line: "M0,25 L300,55", area: "M0,25 L300,55 L300,90 L0,90 Z" } } }]
};

const ALL_COUNTRIES: CountryKey[] = ['INDIA', 'USA', 'UK', 'JAPAN', 'GERMANY', 'CANADA', 'AUSTRALIA', 'FRANCE', 'CHINA', 'BRAZIL', 'UAE', 'SINGAPORE'];

// 📈 Extracted Sub-Component declared safely outside the parent scope to fix reference exceptions
const InteractiveCandlestick = () => {
  const candles = [
    { o: 45, c: 75, h: 85, l: 35 },
    { o: 75, c: 55, h: 80, l: 45 },
    { o: 55, c: 85, h: 90, l: 40 }
  ];

  return (
    <View style={styles.candleVectorBox}>
      <Svg height="100" width={WINDOW_WIDTH - 64} viewBox="0 0 300 100">
        {candles.map((candle, idx) => {
          const xOffset = 45 + idx * 85;
          const up = candle.c >= candle.o;
          const h = Math.abs(candle.c - candle.o);
          const y = 100 - Math.max(candle.c, candle.o);
          const tint = up ? '#00D09C' : '#FF5353';

          return (
            <React.Fragment key={idx}>
              <Line x1={xOffset + 15} y1={100 - candle.h} x2={xOffset + 15} y2={100 - candle.l} stroke={tint} strokeWidth="2" />
              <Rect x={xOffset} y={y} width="30" height={h} fill={tint} rx="3" />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default function WatchlistHubWithRemove() {
  const { isDarkMode } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>('INDIA');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1D');
  const [activeCompanyTicker, setActiveCompanyTicker] = useState<string>('');
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [companyList, setCompanyList] = useState<CompanyAsset[]>([]);

  const containerBg = isDarkMode ? '#0F172A' : '#F6F8FA';
  const glassCardBg = isDarkMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)';
  const glassBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const primaryText = isDarkMode ? '#F8FAFC' : '#1E293B';
  const subText = isDarkMode ? '#94A3B8' : '#64748B';

  useEffect(() => {
    const seeds = SEED_COMPANIES[selectedCountry] || SEED_COMPANIES['INDIA'];
    const formattedSeeds = seeds.map((item, i) => {
      const positive = i % 2 === 0;
      return {
        ticker: item.t,
        name: item.n,
        price: `${item.cur}${item.p}`,
        change: `${positive ? '+' : '-'}${((i + 1) * 0.4).toFixed(2)}%`,
        positive,
        linePath: positive ? "M0,22 L25,14 L50,18 L75,6 L100,2" : "M0,2 L25,12 L50,8 L75,24 L100,20",
        ceo: item.ceo,
        revenue: item.rev,
        eps: item.eps,
        aiPrediction: `Bullish patterns identified natively for ${item.t}.`
      };
    });

    setCompanyList(formattedSeeds);
    if (formattedSeeds.length > 0) {
      setActiveCompanyTicker(formattedSeeds[0].ticker);
    }
  }, [selectedCountry]);

  const handleAddNewCompany = () => {
    const cleanTicker = customTickerInput.trim().toUpperCase();
    if (!cleanTicker) return;

    if (companyList.some(c => c.ticker === cleanTicker)) {
      Alert.alert('Asset Tracked', 'This company asset ticker is already loaded.');
      return;
    }

    const curSign = selectedCountry === 'INDIA' ? '₹' : selectedCountry === 'USA' ? '$' : '€';
    const generatedPrice = Math.floor(Math.random() * 2200) + 120;
    const positive = Math.random() > 0.4;
    const computedChange = (Math.random() * 3.5).toFixed(2);

    const newAsset: CompanyAsset = {
      ticker: cleanTicker,
      name: `${cleanTicker} Capital Corp.`,
      price: `${curSign}${generatedPrice.toLocaleString()}`,
      change: `${positive ? '+' : '-'}${computedChange}%`,
      positive,
      linePath: positive ? "M0,22 L25,14 L50,18 L75,6 L100,2" : "M0,2 L25,12 L50,8 L75,24 L100,20",
      ceo: 'External Appointee Director',
      revenue: `${curSign}${(Math.random() * 90 + 10).toFixed(1)}B`,
      eps: (Math.random() * 12).toFixed(2),
      aiPrediction: `Breakout momentum signals expanding across ${cleanTicker}.`
    };

    setCompanyList([newAsset, ...companyList]);
    setActiveCompanyTicker(cleanTicker);
    setCustomTickerInput('');
  };

  const handleRemoveCompany = (tickerToRemove: string) => {
    Alert.alert(
      'Remove Stock',
      `Are you sure you want to remove ${tickerToRemove} from your current watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedList = companyList.filter(item => item.ticker !== tickerToRemove);
            setCompanyList(updatedList);
            if (activeCompanyTicker === tickerToRemove) {
              setActiveCompanyTicker(updatedList.length > 0 ? updatedList[0].ticker : '');
            }
          }
        }
      ]
    );
  };

  const indicesList = BASE_INDICES[selectedCountry] || BASE_INDICES['INDIA'];
  const currentSelectedCompany = companyList.find(c => c.ticker === activeCompanyTicker);

  return (
    <View style={[styles.root, { backgroundColor: containerBg }]}>
      <View style={[styles.navContainer, { backgroundColor: glassCardBg, borderColor: glassBorder, borderBottomWidth: 1 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {ALL_COUNTRIES.map((country) => {
            const isActive = selectedCountry === country;
            return (
              <TouchableOpacity key={country} onPress={() => setSelectedCountry(country)} style={[styles.navTabPill, isActive && { backgroundColor: isDarkMode ? '#334155' : '#E8FBF7', borderColor: '#00D09C' }]}>
                <Text style={[styles.navTabText, { color: isActive ? '#00D09C' : subText, fontWeight: isActive ? '700' : '600' }]}>{country}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollFrame}>
        <View style={styles.headerRowSpace}>
          <Text style={[styles.sectionTitle, { color: subText }]}>MARKET BENCHMARKS</Text>
          <View style={[styles.timeBarContainer, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
            {(['1D', '1M', '1Y'] as TimeFilter[]).map((filter) => (
              <TouchableOpacity key={filter} onPress={() => setTimeFilter(filter)} style={[styles.timeTabPill, timeFilter === filter && { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                <Text style={[styles.timePillText, { color: timeFilter === filter ? '#00D09C' : subText }]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {indicesList.map((indexItem) => {
          const accentColor = indexItem.positive ? '#00D09C' : '#FF5353';
          const gradientId = `grad_${indexItem.name.replace(/\s+/g, '')}`;
          return (
            <View key={indexItem.name} style={[styles.mainChartCard, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
              <View style={styles.chartTextHeader}>
                <Text style={[styles.mainIndexLabel, { color: subText }]}>{indexItem.name}</Text>
                <View style={styles.flexRowSpace}>
                  <Text style={[styles.mainIndexValue, { color: primaryText }]}>{indexItem.value}</Text>
                  <Text style={[styles.mainIndexDelta, { color: accentColor }]}>{indexItem.delta}</Text>
                </View>
              </View>
              <View style={styles.mainVectorFrame}>
                <Svg height="85" width={WINDOW_WIDTH - 64} viewBox="0 0 300 90">
                  <Defs>
                    <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                      <Stop offset="100%" stopColor={accentColor} stopOpacity="0.00" />
                    </LinearGradient>
                  </Defs>
                  <Path d={indexItem.paths[timeFilter].area} fill={`url(#${gradientId})`} />
                  <Path d={indexItem.paths[timeFilter].line} fill="none" stroke={accentColor} strokeWidth="2.5" />
                </Svg>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { color: subText, marginTop: 14, marginBottom: 10 }]}>CREATE CUSTOM WATCHLIST ITEM</Text>
        <View style={[styles.addInputContainer, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
          <TextInput 
            style={[styles.textInputSpec, { color: primaryText }]}
            placeholder="Type Company Ticker..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={customTickerInput}
            onChangeText={text => setCustomTickerInput(text)}
            autoCapitalize="characters"
          />
          <TouchableOpacity onPress={handleAddNewCompany} style={styles.addTriggerButton}>
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnLabel}>ADD</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: subText, marginTop: 18, marginBottom: 12 }]}>STOCKS WATCHLIST FEED ({companyList.length})</Text>
        
        {companyList.map((company) => {
          const deltaColor = company.positive ? '#00D09C' : '#FF5353';
          const isSelected = activeCompanyTicker === company.ticker;
          
          return (
            <TouchableOpacity 
              key={company.ticker}
              style={[styles.stockCard, { backgroundColor: glassCardBg, borderColor: glassBorder }, isSelected && { borderColor: '#00D09C', borderWidth: 1.5 }]}
              onPress={() => setActiveCompanyTicker(company.ticker)}
              activeOpacity={0.85}
            >
              <View style={styles.leftColumn}>
                <Text style={[styles.tickerText, { color: primaryText }]}>{company.ticker}</Text>
                <Text style={[styles.companyName, { color: subText }]} numberOfLines={1}>{company.name}</Text>
              </View>
              <View style={styles.miniGraphContainer}>
                <Svg height="20" width="60" viewBox="0 0 100 30">
                  <Path d={company.linePath} fill="none" stroke={deltaColor} strokeWidth="2" />
                </Svg>
              </View>
              
              <View style={styles.rightActionRow}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.priceText, { color: primaryText }]}>{company.price}</Text>
                  <Text style={[styles.deltaText, { color: deltaColor }]}>{company.change}</Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => handleRemoveCompany(company.ticker)}
                  style={styles.trashTouchFrame}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="delete-outline" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {currentSelectedCompany && (
          <View style={styles.deepDiveContainer}>
            <Text style={[styles.sectionTitle, { color: subText, marginBottom: 12 }]}>{currentSelectedCompany.ticker} DEEP DIVE ANALYTICS</Text>
            <View style={[styles.detailBoxCard, { backgroundColor: glassCardBg, borderColor: glassBorder }]}>
              <Text style={[styles.detailCardLabel, { color: primaryText }]}>Live Technical Candlesticks</Text>
              <InteractiveCandlestick />
            </View>
            <View style={[styles.detailBoxCard, { backgroundColor: glassCardBg, borderColor: glassBorder, marginTop: 12 }]}>
              <Text style={[styles.detailCardLabel, { color: primaryText, marginBottom: 10 }]}>Company Info & Financials</Text>
              <View style={styles.financialGridRow}>
                <View>
                  <Text style={styles.gridLabel}>MANAGING CEO</Text>
                  <Text style={[styles.gridValue, { color: primaryText }]}>{currentSelectedCompany.ceo}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.gridLabel}>TOTAL REVENUE</Text>
                  <Text style={[styles.gridValue, { color: primaryText }]}>{currentSelectedCompany.revenue}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFrame: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  headerRowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  flexRowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  navContainer: { height: 50, justifyContent: 'center' },
  navTabPill: { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  navTabText: { fontSize: 11, letterSpacing: 0.4 },
  mainChartCard: { borderRadius: 24, borderWidth: 1, marginBottom: 12, padding: 16 },
  chartTextHeader: { width: '100%' },
  mainIndexLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  mainIndexValue: { fontSize: 20, fontWeight: '700', marginTop: 3, letterSpacing: -0.4 },
  mainIndexDelta: { fontSize: 12, fontWeight: '700' },
  mainVectorFrame: { height: 85, marginTop: 8, width: '100%', alignItems: 'center' },
  timeBarContainer: { flexDirection: 'row', gap: 4, borderRadius: 12, padding: 3, borderWidth: 1 },
  timeTabPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  timePillText: { fontSize: 11, fontWeight: '700' },
  addInputContainer: { height: 48, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, overflow: 'hidden' },
  textInputSpec: { flex: 1, height: '100%', fontSize: 13, fontWeight: '600' },
  addTriggerButton: { height: '100%', backgroundColor: '#00D09C', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  stockCard: { flexDirection: 'row', padding: 14, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  leftColumn: { width: '32%' },
  tickerText: { fontSize: 14, fontWeight: '700' },
  companyName: { fontSize: 11, marginTop: 1, fontWeight: '500' },
  miniGraphContainer: { width: 60, height: 20, justifyContent: 'center', alignItems: 'center' },
  rightActionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, width: '38%', justifyContent: 'flex-end' },
  priceText: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  deltaText: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  trashTouchFrame: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.02)' },
  deepDiveContainer: { marginTop: 16 },
  detailBoxCard: { padding: 14, borderRadius: 20, borderWidth: 1 },
  detailCardLabel: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  candleVectorBox: { height: 100, marginTop: 12, width: '100%', alignItems: 'center' },
  financialGridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '800', letterSpacing: 0.4 },
  gridValue: { fontSize: 13, fontWeight: '600', marginTop: 2 }
});