import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackIcon } from '../../svg/BackIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
interface IBackBtn {
  onPress?: () => any;
}
export default function BackButton({ onPress }: IBackBtn) {
  const theme = useTheme() as MyMD3Theme;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
        onPress && onPress();
      }}
    >
      <BackIcon color={theme.colors.base} />
    </TouchableOpacity>
  );
}
