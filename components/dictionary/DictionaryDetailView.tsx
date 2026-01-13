import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import { AppButton, AppDetailHeader, AppInput, AppText } from '../core';
import DetailSection from './core/DetailSection';
import WordCard from './core/WordCard';
import WordInfoCard from './core/WordInfoCard';

export interface DictionaryDetailData {
    id: string;
    term: string;
    phonetic: string;
    category: string;
    level: string;
    definition: string;
    example: string;
    notes?: string;
}

interface DictionaryDetailViewProps {
    data: DictionaryDetailData;
    onSaveNote?: (id: string, note: string) => void;
    onSpeak?: (term: string) => void;
}

// --- MOCK API ---
const fetchRelatedWordsApi = async (category: string, currentId: string): Promise<DictionaryDetailData[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const MOCK_DB = Array.from({ length: 10 }).map((_, i) => ({
                id: `related_${category}_${i}`,
                term: `Related ${i + 1}`,
                phonetic: "/rɪˈleɪtɪd/",
                category: category,
                level: i % 2 === 0 ? 'intermediate' : 'advanced',
                definition: `This is a related term for ${category}.`,
                example: `An example sentence using related term ${i + 1}.`,
            }));
            const filtered = MOCK_DB.filter(item => item.id !== currentId);
            const limit = 2;
            const result = filtered.slice(0, limit);
            resolve(result as DictionaryDetailData[]);
        }, 600);
    });
};

const DictionaryDetailView: React.FC<DictionaryDetailViewProps> = ({
    data,
    onSaveNote,
    onSpeak
}) => {
    const router = useRouter();

    if (!data) return null;

    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteText, setNoteText] = useState(data.notes || '');

    // State cho Related Words
    const [relatedWords, setRelatedWords] = useState<DictionaryDetailData[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    // Effect: Update note when data changes
    useEffect(() => {
        setNoteText(data.notes || '');
    }, [data.notes]);

    // Effect: Load Related Words
    useEffect(() => {
        const loadRelated = async () => {
            if (!data.category) return;
            setIsLoadingRelated(true);
            try {
                const words = await fetchRelatedWordsApi(data.category, data.id);
                setRelatedWords(words);
            } catch (error) {
                console.log("Error fetching related words:", error);
            } finally {
                setIsLoadingRelated(false);
            }
        };
        loadRelated();
    }, [data.category, data.id]);

    const handleSaveNote = () => {
        if (onSaveNote) onSaveNote(data.id, noteText);
        setIsEditingNote(false);
    };

    const handleCancel = () => {
        setNoteText(data.notes || '');
        setIsEditingNote(false);
    };

    const handleStartQuiz = () => {
        router.replace({
            pathname: '/course/[id]',
            params: {
                id: data.category,
                title: `${data.category}`
            }
        });
    };

    const handleRelatedWordPress = (item: DictionaryDetailData) => {
        router.replace({
            pathname: '/dictionary/[id]',
            params: {
                id: item.id,
                term: item.term,
                phonetic: item.phonetic,
                definition: item.definition,
                category: item.category,
                level: item.level,
                example: item.example
            }
        });
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title="Word Details" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Thông tin chính */}
                <WordInfoCard
                    term={data.term || ''}
                    phonetic={data.phonetic || ''}
                    category={data.category || ''}
                    level={data.level || ''}
                    onSpeak={() => onSpeak?.(data.term || '')}
                />

                <DetailSection title="Definition" content={data.definition || ''} />

                <DetailSection
                    title="Example"
                    content={data.example || ''}
                    backgroundColor={theme.colors.background}
                />

                {/* Phần Personal Notes */}
                <View style={styles.noteSection}>
                    <View style={styles.noteHeader}>
                        <View style={styles.titleRow}>
                            <Ionicons name="document-text-outline" size={18} color={theme.colors.secondary} />
                            <AppText size="xs" weight="bold" color={theme.colors.text.secondary} style={{ marginLeft: 8 }}>
                                PERSONAL NOTES
                            </AppText>
                        </View>
                        {!isEditingNote && (
                            <TouchableOpacity onPress={() => setIsEditingNote(true)}>
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
                                multiline={true}      // Cho phép nhiều dòng
                                numberOfLines={4}     // Độ cao mặc định khoảng 4 dòng
                            />

                            <View style={styles.actionButtons}>
                                <AppButton
                                    title="Save Note"
                                    onPress={handleSaveNote}
                                    style={styles.saveBtn}
                                    icon="save-outline"
                                />
                                <AppButton
                                    title="Cancel"
                                    variant="outline"
                                    onPress={handleCancel}
                                    style={styles.cancelBtn}
                                />
                            </View>
                        </View>
                    ) : (
                        <AppText color={theme.colors.text.secondary} style={styles.emptyNote}>
                            {noteText || "No notes yet"}
                        </AppText>
                    )}
                </View>

                {/* --- SEPARATOR --- */}
                <View style={styles.separator} />

                {/* Quiz Action */}
                <View style={styles.quizSection}>
                    <AppText size="md" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
                        Master this topic
                    </AppText>
                    <AppButton
                        title={`Take a ${data.category} Quiz`}
                        icon="game-controller-outline"
                        onPress={handleStartQuiz}
                        style={styles.quizButton}
                    />
                </View>

                {/* Related Words */}
                <View style={styles.relatedContainer}>
                    <AppText size="md" weight="bold" style={styles.relatedTitle}>
                        Related Words ({data.category})
                    </AppText>

                    {isLoadingRelated ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: 8 }}>
                                Finding related terms...
                            </AppText>
                        </View>
                    ) : (
                        relatedWords.length > 0 ? (
                            relatedWords.map((item) => (
                                <WordCard
                                    key={item.id}
                                    id={item.id}
                                    term={item.term}
                                    phonetic={item.phonetic}
                                    definition={item.definition}
                                    level={item.level as any}
                                    category={item.category}
                                    example={item.example}
                                    isBookmarked={false}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 60 },
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