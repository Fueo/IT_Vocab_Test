import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Import Components từ core
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

// ==========================================
// INTERFACE & MOCK API
// ==========================================
export interface DictionaryItem {
    id: string;
    term: string;
    phonetic: string;
    definition: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    example?: string; // Bổ sung để truyền sang Detail
}

const fetchDictionaryApi = async (page: number, limit: number, category: string, search: string) => {
    return new Promise<{ data: DictionaryItem[], total: number, totalPages: number }>((resolve) => {
        setTimeout(() => {
            const ALL_DATA = Array.from({ length: 100 }).map((_, i) => ({
                id: `server_item_${i}`,
                term: i % 2 === 0 ? `Variable ${i}` : `API ${i}`,
                phonetic: i % 2 === 0 ? "/'ver.i.ə.bəl/" : "/ˌeɪ.pi.ˈaɪ/",
                definition: `Technical definition for item ${i}.`,
                example: i % 2 === 0 ? "let x = 10, we can see it;" : "We use the Twitter API.",
                level: (i % 3 === 0 ? 'beginner' : (i % 3 === 1 ? 'intermediate' : 'advanced')) as any,
                category: i % 4 === 0 ? 'Programming' : (i % 4 === 1 ? 'Web' : 'Security')
            }));

            let result = ALL_DATA;
            if (category !== 'All Topics') result = result.filter(item => item.category === category);
            if (search) result = result.filter(item => item.term.toLowerCase().includes(search.toLowerCase()));

            const start = (page - 1) * limit;
            const paginatedData = result.slice(start, start + limit);

            resolve({
                data: paginatedData,
                total: result.length,
                totalPages: Math.ceil(result.length / limit),
            });
        }, 800);
    });
};

const CATEGORIES = ['All Topics', 'Programming', 'Web', 'Database', 'Security', 'Network'];
const ITEMS_PER_PAGE = 10;

const DictionaryView = () => {
    // State dữ liệu
    const [words, setWords] = useState<DictionaryItem[]>([]);
    const [totalWords, setTotalWords] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All Topics');
    const [searchText, setSearchText] = useState('');

    // State quản lý danh sách
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // State Bookmark
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    const loadData = async (page: number, type: 'init' | 'refresh' | 'loadMore' = 'init') => {
        if (type === 'init') setIsLoading(true);
        else if (type === 'loadMore') setIsLoadingMore(true);

        try {
            const response = await fetchDictionaryApi(page, ITEMS_PER_PAGE, selectedCategory, searchText);

            if (type === 'loadMore') {
                setWords(prev => [...prev, ...response.data]);
            } else {
                setWords(response.data);
            }

            setTotalWords(response.total);
            setHasMore(page < response.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
        }
    };

    // Effects xử lý Filter & Search
    useEffect(() => {
        setCurrentPage(1);
        loadData(1, 'init');
    }, [selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            loadData(1, 'init');
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setCurrentPage(1);
        loadData(1, 'refresh');
    };

    const handleLoadMore = () => {
        if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadData(nextPage, 'loadMore');
    };

    const toggleBookmark = (id: string) => {
        setBookmarks(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const displayedWords = bookmarkedOnly ? words.filter(w => bookmarks.has(w.id)) : words;

    return (
        <View style={styles.container}>
            <FlatList
                data={displayedWords}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
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

                        <CategorySelector
                            categories={CATEGORIES}
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />

                        <View style={styles.filterRow}>
                            <AppText size="sm" color={theme.colors.text.secondary}>
                                {totalWords} words found
                            </AppText>

                            <TouchableOpacity
                                style={[styles.filterBtn, bookmarkedOnly && styles.filterBtnActive]}
                                onPress={() => setBookmarkedOnly(!bookmarkedOnly)}
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
                        {/* TRUYỀN TOÀN BỘ ITEM ĐỂ WORDCARD XỬ LÝ CHUYỂN HƯỚNG */}
                        <WordCard
                            id={item.id}
                            term={item.term}
                            phonetic={item.phonetic}
                            definition={item.definition}
                            level={item.level}
                            category={item.category}
                            example={item.example} // Truyền để Detail có dữ liệu ngay
                            isBookmarked={bookmarks.has(item.id)}
                            onBookmarkPress={() => toggleBookmark(item.id)}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <AppListEmpty
                        isLoading={isLoading}
                        title="No technical terms found"
                        description="Try searching for another keyword or check your internet connection."
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
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
    itemWrapper: {
        paddingHorizontal: theme.spacing.md,
    }
});

export default DictionaryView;