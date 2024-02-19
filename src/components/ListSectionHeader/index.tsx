import React from "react";
import { Text, View } from 'react-native';
import { useStyles } from './styles';

export default function SectionHeader ({ title }: { title: string }) {

    const styles = useStyles();
    return (
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    )
};