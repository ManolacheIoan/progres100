import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import { getResourcesForHabit } from '../../constants/resources';

const TABS = [
  { id: 'tips', label: 'Sfaturi impulsuri', emoji: '⚡' },
  { id: 'articles', label: 'Articole', emoji: '📖' },
  { id: 'books', label: 'Cărți', emoji: '📚' },
  { id: 'facts', label: 'Fapte', emoji: '🧠' },
];

export default function ResourcesScreen({ navigation }) {
  const { activeHabit } = useApp();
  const colors = useColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState('tips');
  const [expandedArticle, setExpandedArticle] = useState(null);

  const category = activeHabit?.category || activeHabit?.habitId || 'default';
  const habitIcon = activeHabit?.habitIcon || activeHabit?.icon || '🎯';
  const habitName = activeHabit?.habitName || activeHabit?.name || '';
  const resources = useMemo(() => getResourcesForHabit(category), [category]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={[s.title, { color: colors.text }]}>Resurse</Text>
        {activeHabit && (
          <Text style={[s.subtitle, { color: colors.textMuted }]}>
            {habitIcon} Personalizat pentru: {habitName}
          </Text>
        )}

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll}>
          <View style={s.tabs}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    s.tab,
                    { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={s.tabEmoji}>{tab.emoji}</Text>
                  <Text style={[s.tabLabel, { color: active ? colors.white : colors.textSecondary }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Tips */}
        {activeTab === 'tips' && (
          <View style={s.section}>
            <Text style={[s.sectionDesc, { color: colors.textMuted }]}>
              Tehnici rapide pentru a rezista unui impuls chiar acum.
            </Text>
            {resources.sfaturiImpuls.map((tip, i) => (
              <View
                key={i}
                style={[s.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[s.tipNum, { backgroundColor: colors.primaryFaded }]}>
                  <Text style={[s.tipNumText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[s.tipText, { color: colors.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Articles */}
        {activeTab === 'articles' && (
          <View style={s.section}>
            <Text style={[s.sectionDesc, { color: colors.textMuted }]}>
              Lecturi scurte bazate pe știință despre schimbarea obiceiurilor.
            </Text>
            {resources.articles.map((article) => {
              const expanded = expandedArticle === article.id;
              return (
                <TouchableOpacity
                  key={article.id}
                  onPress={() => setExpandedArticle(expanded ? null : article.id)}
                  style={[s.articleCard, { backgroundColor: colors.card, borderColor: expanded ? colors.primary : colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={s.articleHeader}>
                    <Text style={s.articleEmoji}>{article.emoji}</Text>
                    <View style={s.articleTitleWrap}>
                      <Text style={[s.articleTitle, { color: colors.text }]}>{article.title}</Text>
                    </View>
                    <Text style={[s.articleChevron, { color: colors.textMuted }]}>
                      {expanded ? '▲' : '▼'}
                    </Text>
                  </View>
                  {expanded && (
                    <Text style={[s.articleContent, { color: colors.textSecondary }]}>
                      {article.content}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Books */}
        {activeTab === 'books' && (
          <View style={s.section}>
            <Text style={[s.sectionDesc, { color: colors.textMuted }]}>
              Cărți recomandate pentru transformare reală.
            </Text>
            {resources.books.map((book) => (
              <View
                key={book.id}
                style={[s.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={s.bookEmoji}>{book.emoji}</Text>
                <View style={s.bookInfo}>
                  <Text style={[s.bookTitle, { color: colors.text }]}>{book.title}</Text>
                  <Text style={[s.bookAuthor, { color: colors.primary }]}>{book.author}</Text>
                  <Text style={[s.bookDesc, { color: colors.textMuted }]}>{book.desc}</Text>
                  <View style={s.bookTags}>
                    {(book.tags || []).map((tag) => (
                      <View key={tag} style={[s.tag, { backgroundColor: colors.primaryFaded }]}>
                        <Text style={[s.tagText, { color: colors.primary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Facts */}
        {activeTab === 'facts' && (
          <View style={s.section}>
            {resources.facts.length === 0 ? (
              <>
                <Text style={[s.sectionDesc, { color: colors.textMuted }]}>
                  Fapte generale despre schimbarea obiceiurilor.
                </Text>
                {DEFAULT_FACTS.map((fact, i) => (
                  <View key={i} style={[s.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={s.factEmoji}>🧠</Text>
                    <Text style={[s.factText, { color: colors.textSecondary }]}>{fact}</Text>
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text style={[s.sectionDesc, { color: colors.textMuted }]}>
                  Fapte specifice despre {habitName || 'obiceiul tău'}.
                </Text>
                {resources.facts.map((fact, i) => (
                  <View key={i} style={[s.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={s.factEmoji}>🧠</Text>
                    <Text style={[s.factText, { color: colors.textSecondary }]}>{fact}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DEFAULT_FACTS = [
  'Un obicei se formează în medie în 66 de zile, nu 21 cum se credea anterior.',
  'Creierul nu "uită" obiceiurile vechi — le suprascrie cu altele noi.',
  'Impulsurile durează în medie 15-20 de minute dacă nu sunt întărite.',
  'Contextul (locul, ora, emoția) declanșează automat obiceiurile asociate.',
  'Recompensele imediate mici sunt mai eficiente decât obiectivele mari îndepărtate.',
];

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
    backBtn: { marginBottom: 8 },
    backText: { fontSize: 16, fontWeight: '600' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 16 },
    tabScroll: { marginBottom: 20 },
    tabs: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
    tab: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1.5,
    },
    tabEmoji: { fontSize: 14 },
    tabLabel: { fontSize: 13, fontWeight: '600' },
    section: { gap: 12 },
    sectionDesc: { fontSize: 13, lineHeight: 19, marginBottom: 4 },
    tipCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      borderRadius: 14, padding: 14, borderWidth: 1,
    },
    tipNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    tipNumText: { fontSize: 13, fontWeight: '800' },
    tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
    articleCard: {
      borderRadius: 14, padding: 16, borderWidth: 1.5,
    },
    articleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    articleEmoji: { fontSize: 24 },
    articleTitleWrap: { flex: 1 },
    articleTitle: { fontSize: 15, fontWeight: '700' },
    articleChevron: { fontSize: 12, fontWeight: '700' },
    articleContent: { fontSize: 14, lineHeight: 21, marginTop: 12 },
    bookCard: {
      flexDirection: 'row', gap: 14, borderRadius: 14, padding: 16, borderWidth: 1, alignItems: 'flex-start',
    },
    bookEmoji: { fontSize: 36 },
    bookInfo: { flex: 1, gap: 4 },
    bookTitle: { fontSize: 16, fontWeight: '700' },
    bookAuthor: { fontSize: 13, fontWeight: '600' },
    bookDesc: { fontSize: 13, lineHeight: 18 },
    bookTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    tag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    tagText: { fontSize: 11, fontWeight: '600' },
    factCard: {
      flexDirection: 'row', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'flex-start',
    },
    factEmoji: { fontSize: 20 },
    factText: { flex: 1, fontSize: 14, lineHeight: 20 },
  });
}
