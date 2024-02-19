import { Platform, StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";
import type { MyMD3Theme } from "../../providers/amity-ui-kit-provider";

export const useStyles = () => {

    const theme = useTheme() as MyMD3Theme;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        backIcon: {
            width: 25,
            height: 25,
        },
        navBarTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 10,
        },
        placeholder: {
            width: 25,
            height: 25,
        },
        rowContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            marginHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        iconContainer: {
            width: 28,
            height: 28,
            borderRadius: 4,
            backgroundColor: '#EFEFEF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
        },
        icon: {
            width: 18,
            height: 16,
        },
        groupIcon: {
            width: 20,
            height: 14,
        },
        arrowIcon: {
            width: 10,
            height: 17,
        },
        rowText: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.base
        },
        ChatSettingContainer: {
            alignItems: 'center',
            paddingHorizontal: 8
        },
        leaveChatText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FF0000',
        },
        leaveChatLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: 'red',
        },
        reportChatLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.base

        },
        header: {
            paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for iOS notch
            zIndex: 1,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.background,
        },
        closeButton: {
            padding: 3,
        },
        headerTextContainer: {
            flex: 1,
            flexDirection:'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
          headerText: {
            fontWeight: '600',
            fontSize: 17,
            textAlign: 'center',
            color: theme.colors.base
          },
    })
    return styles;
}

