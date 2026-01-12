import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import DictionaryView from '../../components/dictionary/DictionaryView';

const DictionaryScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" />
            <DictionaryView />
        </View>
    );
};

export default DictionaryScreen;