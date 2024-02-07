import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackIcon } from '../../svg/BackIcon';
interface IBackBtn {
  onPress: () => any;
}
export default function BackButton({ onPress }: IBackBtn) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
        onPress && onPress();
      }}
    >
      <BackIcon/>
    </TouchableOpacity>
  );
}
