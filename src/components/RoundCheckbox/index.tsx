import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from './styles';

export default function RoundCheckbox({ isChecked }: { isChecked: boolean }) {

  const styles = useStyles();
  
  return (
    <View style={[styles.roundCheckbox, isChecked && styles.checked]}>
      {isChecked && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
}
