import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Import Components
import theme from '../../theme';
import { AppBanner, AppButton, AppText } from '../core';
import AnswerButton from './core/AnswerButton';
import FeedbackBottom from './core/FeedbackBottom';
import QuizHeader from './core/QuizHeader';

// Dữ liệu giả lập
const QUESTIONS = [
    {
        id: '1',
        term: 'Variable',
        question: 'What does this IT term mean?',
        example: "let name = 'John'; // name is a variable storing the value 'John'",
        options: [
            'A container for storing data values',
            'A type of loop',
            'A mathematical operator',
            'A programming language'
        ],
        correctAnswer: 'A container for storing data values',
        explanation: 'A variable is a named storage location that can hold different values during program execution.'
    },
    {
        id: '1',
        term: 'Variable',
        question: 'What does this IT term mean?',
        example: "let name = 'John'; // name is a variable storing the value 'John'",
        options: [
            'A container for storing data values',
            'A type of loop',
            'A mathematical operator',
            'A programming language'
        ],
        correctAnswer: 'A container for storing data values',
        explanation: 'A variable is a named storage location that can hold different values during program execution.'
    },
    {
        id: '1',
        term: 'Variable',
        question: 'What does this IT term mean?',
        example: "let name = 'John'; // name is a variable storing the value 'John'",
        options: [
            'A container for storing data values',
            'A type of loop',
            'A mathematical operator',
            'A programming language'
        ],
        correctAnswer: 'A container for storing data values',
        explanation: 'A variable is a named storage location that can hold different values during program execution.'
    },
    // ... các câu hỏi khác
];

const QuizGameView = () => {
    const { mode } = useLocalSearchParams();
    const isLearningMode = mode === 'learning';

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [status, setStatus] = useState<'playing' | 'checked'>('playing');
    const [correctCount, setCorrectCount] = useState(0);
    const [showHint, setShowHint] = useState(false);

    const question = QUESTIONS[currentQuestionIndex];

    const handleCheck = () => {
        if (!selectedOption) return;
        const isCorrect = selectedOption === question.correctAnswer;
        if (isCorrect) setCorrectCount(prev => prev + 1);
        setStatus('checked');
    };

    const handleSeeAnswer = () => {
        setSelectedOption(question.correctAnswer);
        setStatus('checked');
    };

    const handleContinue = () => {
        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setStatus('playing');
            setShowHint(false);
        } else {
            router.replace({
                pathname: '/game/result',
                params: {
                    correct: correctCount,
                    total: QUESTIONS.length,
                    courseTitle: 'Programming Basics'
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            <QuizHeader
                current={currentQuestionIndex}
                total={QUESTIONS.length}
                onClose={() => router.back()}
            />

            <View style={styles.gameContent}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Row */}
                    <View style={styles.questionHeaderRow}>
                        <AppText size="xs" color={theme.colors.text.secondary} style={styles.label}>
                            LEARN THIS WORD
                        </AppText>
                        {isLearningMode && (
                            <TouchableOpacity
                                onPress={() => setShowHint(!showHint)}
                                style={styles.hintToggle}
                                activeOpacity={0.6}
                            >
                                <Ionicons
                                    name={showHint ? "eye-off-outline" : "bulb-outline"}
                                    size={18}
                                    color={theme.colors.secondary}
                                />
                                <AppText size="sm" weight="bold" color={theme.colors.secondary} style={styles.hintText}>
                                    {showHint ? "Hide Hint" : "Hint"}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Question Box */}
                    <View style={styles.questionBox}>
                        <View style={styles.termRow}>
                            <View style={styles.speakerIcon}>
                                <Ionicons name="volume-high" size={20} color={theme.colors.primary} />
                            </View>
                            <AppText size="xl" weight="bold" color={theme.colors.text.primary}>
                                {question.term}
                            </AppText>
                        </View>
                        <AppText size="md" color={theme.colors.text.secondary}>
                            {question.question}
                        </AppText>
                    </View>

                    {/* Hint Box */}
                    {showHint && (
                        <AppBanner
                            variant="info"
                            icon="bulb"
                            title="Example: "
                            message={question.example}
                            containerStyle={styles.hintBanner}
                        />
                    )}

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {question.options.map((option, index) => {
                            let btnState: 'default' | 'selected' | 'correct' | 'wrong' | 'disabled' = 'default';

                            if (status === 'playing') {
                                btnState = selectedOption === option ? 'selected' : 'default';
                            } else {
                                if (option === question.correctAnswer) btnState = 'correct';
                                else if (option === selectedOption) btnState = 'wrong';
                                else btnState = 'disabled';
                            }

                            return (
                                <AnswerButton
                                    key={index}
                                    text={option}
                                    state={btnState}
                                    onPress={() => status === 'playing' && setSelectedOption(option)}
                                />
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Footer Action */}
                {status === 'playing' ? (
                    <View style={styles.footer}>
                        <View style={styles.buttonRow}>
                            {isLearningMode && (
                                <AppButton
                                    title="See Answer"
                                    onPress={handleSeeAnswer}
                                    variant="outline"
                                    style={styles.halfButton}
                                />
                            )}

                            <AppButton
                                title="Check Answer"
                                onPress={handleCheck}
                                variant="primary"
                                disabled={!selectedOption}
                                style={isLearningMode ? styles.halfButton : styles.fullButton}
                            />
                        </View>
                    </View>
                ) : (
                    <FeedbackBottom
                        isCorrect={selectedOption === question.correctAnswer}
                        explanation={question.explanation}
                        onContinue={handleContinue}
                        isLastQuestion={currentQuestionIndex === QUESTIONS.length - 1}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gameContent: {
        flex: 1,
        position: 'relative',
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: 150,
    },
    questionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
        minHeight: 30,
    },
    label: {
        textTransform: 'uppercase',
        flex: 1,
    },
    hintToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.xxs,
        paddingLeft: theme.spacing.sm,
    },
    hintText: {
        marginLeft: theme.spacing.xs,
    },
    questionBox: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    termRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    speakerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.smd,
        elevation: 1,
    },
    hintBanner: {
        marginBottom: theme.spacing.lg,
    },
    optionsContainer: {
        marginTop: theme.spacing.sm,
    },
    footer: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    halfButton: {
        flex: 1,
    },
    fullButton: {
        width: '100%',
    }
});

export default QuizGameView;