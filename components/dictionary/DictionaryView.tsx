import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import theme from '../../theme';
import {
  AppInput,
  AppListEmpty,
  AppListFooter,
  AppText,
  CategorySelector,
  HomeHeader
} from '../core';
import WordCard from './core/WordCard';

// Import AppDialog
import AppDialog, { DialogType } from '../core/AppDialog';

import {
  dictionaryApi,
  DictionaryLevel,
  fetchDictionaryApi,
  PinnedItem,
  TopicDto
} from '../../api/dictionary';

// 👇 UPDATE: Import Auth Utils (Không cần tokenStore ở đây nữa nếu chỉ dùng để check auth)
import { requireAuth } from '../../utils/authUtils';

export interface DictionaryItem {
  id: string;
  term: string;
  phonetic: string;
  definition: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  example?: string;
  isPinned?: boolean;
}

const ITEMS_PER_PAGE = 10;

const DictionaryView = () => {
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [totalWords, setTotalWords] = useState(0);

  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Topics']);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // --- Dialog State ---
  // 👇 Cập nhật type state để khớp với requireAuth (thêm confirmText)
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string; 
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const isLoadingRef = useRef(false);
  const requestSeqRef = useRef(0);

  // Helper: Map từ PinnedItem (API) sang DictionaryItem (UI)
  const mapPinnedItemToDictionaryItem = (item: PinnedItem): DictionaryItem => {
    const w = item.word;
    
    const def = (w.meaningEN && w.meaningEN.trim()) ||
                (w.meaningVN && w.meaningVN.trim()) ||
                (w.standFor && w.standFor.trim()) ||
                (w.example && w.example.trim()) || "";

    let levelStr: DictionaryLevel = 'beginner';
    if (w.level === 2) levelStr = 'intermediate';
    if (w.level > 2) levelStr = 'advanced';

    return {
      id: w._id,
      term: w.word,
      phonetic: w.pronunciation || '',
      definition: def,
      level: levelStr,
      category: 'Saved',
      example: w.example || undefined,
      isPinned: true,
    };
  };

  const applyTopicsToUI = (t: TopicDto[]) => {
    setTopics(t);
    const unique = Array.from(new Set(t.map(x => x.topicName)));
    setCategories(['All Topics', ...unique]);
  };

  const loadData = useCallback(async (page: number, type: 'init' | 'refresh' | 'loadMore' = 'init') => {
    if (isLoadingRef.current && type === 'loadMore') return;
    
    isLoadingRef.current = true;
    const seq = ++requestSeqRef.current;

    if (type === 'init') setIsLoading(true);
    else if (type === 'loadMore') setIsLoadingMore(true);

    try {
      let newData: DictionaryItem[] = [];
      let total = 0;
      let totalPages = 0;
      let newTopics: TopicDto[] | undefined;

      if (bookmarkedOnly) {
        const res = await dictionaryApi.listPinnedWords({
          page,
          pageSize: ITEMS_PER_PAGE,
        });

        newData = res.items.map(mapPinnedItemToDictionaryItem);
        total = res.total;
        totalPages = res.totalPages;
      } else {
        const res = await fetchDictionaryApi(page, ITEMS_PER_PAGE, selectedCategory, searchText);
        newData = res.data;
        total = res.total;
        totalPages = res.totalPages;
        newTopics = res.topics;
      }

      if (seq !== requestSeqRef.current) return;

      if (page === 1 && newTopics) {
        applyTopicsToUI(newTopics);
      }

      setBookmarks(prev => {
        const next = new Set(prev);
        newData.forEach(item => {
          if (item.isPinned) next.add(item.id);
        });
        return next;
      });

      if (type === 'loadMore') {
        setWords(prev => {
          const map = new Map<string, DictionaryItem>();
          prev.forEach(x => map.set(String(x.id), x));
          newData.forEach(x => map.set(String(x.id), x));
          return Array.from(map.values());
        });
      } else {
        setWords(newData);
      }

      setTotalWords(total);
      setHasMore(page < totalPages);
      
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      if (seq === requestSeqRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    }
  }, [selectedCategory, searchText, bookmarkedOnly]);

  useEffect(() => {
    setIsLoading(true);
    setWords([]); 
    setCurrentPage(1);
    setHasMore(true);
    
    const timer = setTimeout(() => {
      loadData(1, 'init');
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchText, bookmarkedOnly, loadData]);

  const handleRefresh = useCallback(() => {
    if (isLoadingRef.current) return;
    setIsRefreshing(true);
    setCurrentPage(1);
    loadData(1, 'refresh');
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (words.length === 0) return;
    if (!hasMore || isLoadingRef.current || isRefreshing) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadData(nextPage, 'loadMore');
  }, [hasMore, isRefreshing, currentPage, loadData, words.length]);


  // 👇 UPDATE: Refactor sử dụng requireAuth
  const handleSavedFilterPress = () => {
    // Nếu đang bật chế độ Saved -> Tắt đi (Không cần check auth)
    if (bookmarkedOnly) {
      setBookmarkedOnly(false);
      return;
    }

    // Nếu muốn bật chế độ Saved -> Check Auth
    requireAuth(
      router,
      setDialogConfig,
      () => {
         // Callback khi đã login
         setBookmarkedOnly(true);
      },
      {
         message: 'Bạn cần đăng nhập để xem danh sách từ đã lưu.'
      }
    );
  };

  // 👇 UPDATE: Refactor sử dụng requireAuth
  const toggleBookmark = (id: string) => {
    requireAuth(
      router,
      setDialogConfig,
      async () => {
        // Callback khi đã login -> Thực hiện logic toggle
        const isCurrentlyBookmarked = bookmarks.has(id);

        setBookmarks(prev => {
          const newSet = new Set(prev);
          isCurrentlyBookmarked ? newSet.delete(id) : newSet.add(id);
          return newSet;
        });

        if (bookmarkedOnly && isCurrentlyBookmarked) {
            setWords(prev => prev.filter(w => w.id !== id));
            setTotalWords(prev => Math.max(0, prev - 1));
        }

        try {
          if (isCurrentlyBookmarked) {
            await dictionaryApi.unpinWord(id);
          } else {
            await dictionaryApi.pinWord(id);
          }
        } catch (error) {
          console.error("Pin word error:", error);
          
          setBookmarks(prev => {
            const newSet = new Set(prev);
            !isCurrentlyBookmarked ? newSet.delete(id) : newSet.add(id);
            return newSet;
          });

          setDialogConfig({
            visible: true,
            type: 'error',
            title: 'Lỗi',
            message: 'Không thể cập nhật trạng thái đã lưu. Vui lòng thử lại.',
          });
        }
      },
      {
         message: 'Bạn cần đăng nhập để lưu từ vựng vào kho cá nhân.'
      }
    );
  };

  const handleWordPress = (id: string) => {
    router.push(`/dictionary/${id}`);
  };

  const displayedWords = words; 

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedWords}
        keyExtractor={(item, index) => (item?.id ? String(item.id) : `row-${index}`)}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.5} 
        onEndReached={handleLoadMore}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}

        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <HomeHeader
              title="Dictionary"
              subtitle="Search IT vocabulary"
              rightIcon="book-outline"
              bottomContent={
                <AppInput
                  placeholder="Search words..."
                  value={searchText}
                  onChangeText={setSearchText}
                  icon="search-outline"
                  style={styles.searchInput}
                  containerStyle={{ marginBottom: 0 }}
                />
              }
              height={240}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />

            {!bookmarkedOnly && (
              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}

            <View style={styles.filterRow}>
              <AppText size="sm" color={theme.colors.text.secondary}>
                {totalWords} words found
              </AppText>

              <TouchableOpacity
                style={[styles.filterBtn, bookmarkedOnly && styles.filterBtnActive]}
                onPress={handleSavedFilterPress}
              >
                <Ionicons
                  name={bookmarkedOnly ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={bookmarkedOnly ? theme.colors.primary : theme.colors.text.secondary}
                />
                <AppText
                  size="xs"
                  weight="bold"
                  color={bookmarkedOnly ? theme.colors.primary : theme.colors.text.secondary}
                  style={{ marginLeft: theme.spacing.xs }}
                >
                  Saved
                </AppText>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <WordCard
              id={item.id}
              term={item.term}
              phonetic={item.phonetic}
              definition={item.definition}
              level={item.level}
              category={item.category}
              example={item.example}
              isBookmarked={bookmarks.has(item.id)}
              onBookmarkPress={() => toggleBookmark(item.id)}
              onPress={() => handleWordPress(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <AppListEmpty
            isLoading={isLoading}
            title={bookmarkedOnly ? "No saved words" : "No technical terms found"}
            description={bookmarkedOnly ? "Bookmark words to see them here." : "Try searching for another keyword."}
          />
        }
        ListFooterComponent={
          <AppListFooter
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            dataLength={words.length}
          />
        }
      />

      <AppDialog
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={dialogConfig.onConfirm}
        // 👇 Truyền confirmText từ state xuống
        confirmText={dialogConfig.confirmText} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { paddingBottom: theme.spacing.xl },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 0,
    height: 48,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.smd,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.text.white,
  },
  filterBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  itemWrapper: { paddingHorizontal: theme.spacing.md },
});

export default DictionaryView;