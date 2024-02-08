
import { StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";
import type { MyMD3Theme } from "../../providers/amity-ui-kit-provider";

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    icon: {
      backgroundColor: '#D9E5FC',
      width: 42,
      height: 42,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 72,
    },
    chatCard: {
      backgroundColor: theme.colors.background,
      paddingLeft: 16,
      flexDirection: 'row',
    },
    chatDetailSection: {
      flex: 6,
      borderBottomColor: '#EBECEF',
      borderBottomWidth: 1,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingRight: 16,
  
    },
  
    avatarSection: {
      flex: 1,
      paddingVertical: 16,
      marginRight: 10,
    },
    chatName: {
      fontWeight: '600',
      fontSize: 17,
      color: theme.colors.base,
      width: 'auto',
      maxWidth: 200,
    },
    chatNameWrap: {
      flexDirection: 'row',
    },
    chatLightText: {
      fontWeight: '400',
      fontSize: 13,
      marginHorizontal: 4,
      marginVertical: 2,
      color: theme.colors.baseShade1
    },
    unReadBadge: {
      borderRadius: 72,
      backgroundColor: '#FA4D31',
      width: 'auto',
      display: 'flex',
      alignItems: 'center',
      marginVertical: 2,
      minWidth: 22,
    },
    unReadText: {
      color: '#FFFFFF',
      textAlign: 'center',
      padding: 3,
      minWidth: 20,
    },
    chatTimeWrap: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 72,
      marginRight: 8,
      marginLeft: 10,
    },
  });
  return styles
}

