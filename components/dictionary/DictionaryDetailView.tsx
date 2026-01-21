import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import { AppButton, AppDetailHeader, AppInput, AppText } from '../core';
import DetailSection from './core/DetailSection';
import WordCard from './core/WordCard';
import WordInfoCard from './core/WordInfoCard';

// Import AppDialog
import AppDialog, { DialogType } from '../core/AppDialog';

// Import API
import { dictionaryApi, WordDto } from '../../api/dictionary';

// Import Auth Utils
import { requireAuth } from '../../utils/authUtils';

export interface DictionaryDetailData {
    id: string;
    term: string;
    phonetic: string;
    topicId: string;
    topicName: string;
    level: string;
    wordLevel?: number;
    definitionEN: string; 
    definitionVN: string;
    example: string;
    notes?: string;
    // 👇 UPDATE: Thêm trường này để biết trạng thái đã lưu hay chưa từ API
    isPinned?: boolean; 
}

const DictionaryDetailView = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // State Data
    const [data, setData] = useState<DictionaryDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State Toggle Language
    const [isEnglish, setIsEnglish] = useState(true);

    // State Note
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // State Related Words
    const [relatedWords, setRelatedWords] = useState<DictionaryDetailData[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    // 👇 UPDATE: State quản lý Bookmarks
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    // State Dialog
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

    const mapWordToDetail = (w: WordDto): DictionaryDetailData => {
        let levelStr = 'beginner';
        if (w.level === 2) levelStr = 'intermediate';
        if (w.level > 2) levelStr = 'advanced';

        return {
            id: w._id,
            term: w.word,
            phonetic: w.pronunciation || '',
            topicId: w.topicId, 
            topicName: w.topicName || 'General', 
            level: levelStr,
            wordLevel: w.level,
            definitionEN: w.meaningEN || '',
            definitionVN: w.meaningVN || '',
            example: w.example || '',
            notes: w.note || '',
            // 👇 UPDATE: Map isPinned từ API (Giả sử API trả về field này)
            isPinned: w.isPinned || false, 
        };
    };

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await dictionaryApi.getWordDetail(id);
                const mappedData = mapWordToDetail(res.word);
                
                setData(mappedData);
                setNoteText(mappedData.notes || '');
                setIsEnglish(true); 

                // 👇 UPDATE: Cập nhật state bookmarks nếu từ này đã được ghim
                if (mappedData.isPinned) {
                    setBookmarks(prev => new Set(prev).add(mappedData.id));
                }
                
                fetchRelatedWords(mappedData.topicId, mappedData.id, mappedData.topicName);
            } catch (err) {
                console.error(err);
                setError("Could not load word details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const fetchRelatedWords = async (topicId: string | undefined, currentId: string, topicName: string) => {
        if (!topicId) return;
        setIsLoadingRelated(true);
        try {
            const res = await dictionaryApi.listWords({
                topicId: topicId,
                page: 1,
                pageSize: 6 
            });

            const related = (res.items || [])
                .filter(item => String(item.id) !== currentId)
                .slice(0, 5)
                .map(item => {
                    // 👇 UPDATE: Cập nhật bookmarks cho related words
                    if (item.isPinned) {
                        setBookmarks(prev => new Set(prev).add(String(item.id)));
                    }

                    return {
                        id: String(item.id),
                        term: item.term,
                        phonetic: item.phonetic,
                        topicId: topicId,
                        topicName: topicName, 
                        level: typeof item.level === 'string' ? item.level : 'beginner',
                        definitionEN: item.definition, 
                        definitionVN: "",
                        example: item.example || '',
                        isPinned: item.isPinned || false
                    } as DictionaryDetailData;
                });

            setRelatedWords(related);
        } catch (error) {
            console.log("Error fetching related words:", error);
        } finally {
            setIsLoadingRelated(false);
        }
    };

    // 👇 UPDATE: Hàm xử lý Bookmark (dùng requireAuth)
    const toggleBookmark = (wordId: string) => {
        requireAuth(
            router,
            setDialogConfig,
            async () => {
                // Logic chạy khi đã Login
                const isCurrentlyBookmarked = bookmarks.has(wordId);

                // 1. Optimistic Update (Cập nhật UI ngay lập tức)
                setBookmarks(prev => {
                    const newSet = new Set(prev);
                    isCurrentlyBookmarked ? newSet.delete(wordId) : newSet.add(wordId);
                    return newSet;
                });

                // 2. Call API
                try {
                    if (isCurrentlyBookmarked) {
                        await dictionaryApi.unpinWord(wordId);
                    } else {
                        await dictionaryApi.pinWord(wordId);
                    }
                } catch (error) {
                    console.error("Pin word error:", error);
                    // Revert nếu lỗi
                    setBookmarks(prev => {
                        const newSet = new Set(prev);
                        !isCurrentlyBookmarked ? newSet.delete(wordId) : newSet.add(wordId);
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

    const handleRequestEditNote = () => {
        requireAuth(
            router, 
            setDialogConfig, 
            () => setIsEditingNote(true), 
            { message: 'Bạn cần đăng nhập để sử dụng tính năng Ghi chú cá nhân.' }
        );
    };

    const handleSaveNote = async () => {
        if (!data) return;
        setIsSavingNote(true);
        try {
            await dictionaryApi.upsertNote(data.id, { note: noteText });
            setData(prev => prev ? { ...prev, notes: noteText } : null);
            setIsEditingNote(false);
            setDialogConfig({
                visible: true,
                type: 'success',
                title: 'Thành công',
                message: 'Ghi chú đã được lưu.',
                onConfirm: undefined, 
                confirmText: undefined
            });
        } catch (error) {
            console.error(error);
            setDialogConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể lưu ghi chú. Vui lòng thử lại.',
            });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCancelNote = () => {
        setNoteText(data?.notes || '');
        setIsEditingNote(false);
    };

    const handleStartQuiz = () => {
        if (!data) return;
        router.replace({
            pathname: '/course/[id]',
            params: {
                id: `${data.topicId}:${data.wordLevel}`,
                title: data.topicName,
                level: data.wordLevel ?? 1,
                fromTab: "TOPIC"
            }
        });
    };

    const handleRelatedWordPress = (item: DictionaryDetailData) => {
        // Reset navigation để load từ mới
        router.replace({
            pathname: '/dictionary/[id]',
            params: { id: item.id }
        });
    };

    // 👇 Helper Render nút Bookmark trên Header
    const renderHeaderRight = () => {
        if (!data) return null;
        const isBookmarked = bookmarks.has(data.id);
        
        return (
            <TouchableOpacity onPress={() => toggleBookmark(data.id)}>
                <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={theme.colors.primary}
                />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !data) {
        return (
            <View style={[styles.container, styles.center]}>
                <AppText color={theme.colors.error}>{error || "Word not found"}</AppText>
                <AppButton 
                    title="Go Back" 
                    onPress={() => router.back()} 
                    variant="outline"
                    style={{ marginTop: 20 }}
                />
            </View>
        );
    }

    const currentDefinition = isEnglish 
        ? (data.definitionEN || "No English definition available.")
        : (data.definitionVN || "Chưa có định nghĩa tiếng Việt.");

    return (
        <View style={styles.container}>
            {/* 👇 UPDATE: Truyền nút Bookmark vào prop rightContent */}
            <AppDetailHeader 
                title="Word Details" 
                rightContent={renderHeaderRight()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Thông tin chính */}
                <WordInfoCard
                    term={data.term}
                    phonetic={data.phonetic}
                    category={data.topicName} 
                    level={data.level}
                />

                {/* Section Definition */}
                <View style={styles.definitionWrapper}>
                    <View style={styles.definitionHeader}>
                        <AppText size="md" weight="bold" color={theme.colors.text.primary}>
                            Definition
                        </AppText>
                        
                        <TouchableOpacity 
                            style={styles.langToggle} 
                            onPress={() => setIsEnglish(!isEnglish)}
                            activeOpacity={0.7}
                        >
                            <AppText size="xs" weight="bold" color={theme.colors.primary}>
                                {isEnglish ? "VN   🇻🇳" : "EN   🇬🇧"}
                            </AppText>
                            <Ionicons name="swap-horizontal" size={theme.fontSizes.md} color={theme.colors.primary} style={{marginLeft: theme.spacing.sm}} />
                        </TouchableOpacity>
                    </View>
                    
                    <AppText size="md" color={theme.colors.text.primary} style={{ lineHeight: 24 }}>
                        {currentDefinition}
                    </AppText>
                </View>

                {data.example ? (
                    <DetailSection
                        title="Example"
                        content={data.example}
                        backgroundColor={theme.colors.background}
                    />
                ) : null}

                {/* Personal Notes */}
                <View style={styles.noteSection}>
                    <View style={styles.noteHeader}>
                        <View style={styles.titleRow}>
                            <Ionicons name="document-text-outline" size={18} color={theme.colors.secondary} />
                            <AppText size="xs" weight="bold" color={theme.colors.text.secondary} style={{ marginLeft: 8 }}>
                                PERSONAL NOTES
                            </AppText>
                        </View>
                        {!isEditingNote && (
                            <TouchableOpacity onPress={handleRequestEditNote}>
                                <AppText size="sm" color={theme.colors.secondary} weight="bold">
                                    {noteText ? "Edit Note" : "Add Note"}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditingNote ? (
                        <View style={styles.inputContainer}>
                            <AppInput
                                placeholder="Add your personal notes here..."
                                value={noteText}
                                onChangeText={setNoteText}
                                multiline={true}
                                numberOfLines={4}
                            />

                            <View style={styles.actionButtons}>
                                <AppButton
                                    title={isSavingNote ? "Saving..." : "Save Note"}
                                    onPress={handleSaveNote}
                                    style={styles.saveBtn}
                                    icon="save-outline"
                                    disabled={isSavingNote}
                                />
                                <AppButton
                                    title="Cancel"
                                    variant="outline"
                                    onPress={handleCancelNote}
                                    style={styles.cancelBtn}
                                    disabled={isSavingNote}
                                />
                            </View>
                        </View>
                    ) : (
                        <AppText color={theme.colors.text.secondary} style={styles.emptyNote}>
                            {noteText || "No notes yet"}
                        </AppText>
                    )}
                </View>

                <View style={styles.separator} />

                {/* Quiz Action */}
                <View style={styles.quizSection}>
                    <AppText size="md" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
                        Master this topic
                    </AppText>
                    <AppButton
                        title={`Take a Quiz (${data.topicName})`}
                        icon="game-controller-outline"
                        onPress={handleStartQuiz}
                        style={styles.quizButton}
                    />
                </View>

                {/* Related Words */}
                <View style={styles.relatedContainer}>
                    <AppText size="md" weight="bold" style={styles.relatedTitle}>
                        Related Words
                    </AppText>

                    {isLoadingRelated ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    ) : (
                        relatedWords.length > 0 ? (
                            relatedWords.map((item) => (
                                <WordCard
                                    key={item.id}
                                    id={item.id}
                                    term={item.term}
                                    phonetic={item.phonetic}
                                    definition={item.definitionEN}
                                    level={item.level as any}
                                    category={item.topicName}
                                    example={item.example}
                                    // 👇 UPDATE: Truyền trạng thái bookmark và hàm xử lý
                                    isBookmarked={bookmarks.has(item.id)} 
                                    onBookmarkPress={() => toggleBookmark(item.id)}
                                    onPress={() => handleRelatedWordPress(item)}
                                />
                            ))
                        ) : (
                            <AppText size="sm" color={theme.colors.text.secondary} style={{ fontStyle: 'italic' }}>
                                No related words found.
                            </AppText>
                        )
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <AppDialog
                visible={dialogConfig.visible}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                confirmText={dialogConfig.confirmText}
                onConfirm={dialogConfig.onConfirm}
                onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 60 },
    
    definitionWrapper: {
        backgroundColor: 'white',
        padding: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    definitionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    langToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    noteSection: {
        backgroundColor: 'white',
        padding: theme.spacing.lg,
        borderRadius: 20,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md
    },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    emptyNote: { fontStyle: 'italic', paddingVertical: theme.spacing.sm },
    inputContainer: { marginTop: theme.spacing.xs },
    actionButtons: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        gap: theme.spacing.sm
    },
    saveBtn: { flex: 2, marginBottom: 0 },
    cancelBtn: { flex: 1, marginBottom: 0 },
    separator: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.md,
        marginVertical: theme.spacing.sm,
    },
    quizSection: {
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    quizButton: {
        backgroundColor: theme.colors.primary,
    },
    relatedContainer: {
        paddingHorizontal: theme.spacing.md,
    },
    relatedTitle: {
        marginBottom: theme.spacing.md,
        color: theme.colors.text.primary,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    }
});

export default DictionaryDetailView;