import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";
import type { MyMD3Theme } from "../../providers/amity-ui-kit-provider";

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    topBarContainer: {
      backgroundColor: theme.colors.chatTopBar,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,

    },
    textChatBubble: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginVertical: 5,
      padding: 10,
    },
    deletedMessageContainer: {
      alignSelf: 'flex-start',
      borderRadius: 10,
      marginVertical: 15,
    },
    imageChatBubble: {
      marginVertical: 5,
      borderRadius: 10,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor:  theme.colors.chatBubbles?.userBubble,
      maxWidth: '100%',
      marginLeft: 60
    },
    userMessageDelete: {
      alignSelf: 'flex-end',
      maxWidth: '100%',
    },
    friendMessageDelete: {
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    userImageBubble: {
      alignSelf: 'flex-end',
      backgroundColor: 'transparent',
    },
    friendBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.chatBubbles?.friendBubble,
      maxWidth: '100%',
      marginRight: 60
    },
    chatUserText: {
      fontSize: 16,
      color: theme.colors.chatMessageTexts?.userMessageText,
    },
    chatFriendText: {
      fontSize: 16,
      color:  theme.colors.chatMessageTexts?.friendMessageText,
    },
    deletedMessage: {
      color: '#898E9E',
      marginLeft: 5
    },
    deletedMessageRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    chatTimestamp: {
      fontSize: 13,
      color: theme.colors.baseShade2,
      marginTop: 4,
    },
    AllInputWrap: {
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border
    },
    InputWrap: {
      backgroundColor: theme.colors.background,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 25,
      paddingTop: 10,
      alignItems: 'center',
    },
    chatContainer: {
      flex: 1,
      paddingHorizontal: 10,
    },

    input: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 20,
      fontSize: 15,
      color: theme.colors.base,
      width: '90%',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    sendButton: {
      backgroundColor: '#1E90FF',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginLeft: 10,
    },
    sendButtonText: {
      color: '#FFF',
      fontSize: 16,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.chatTopBar,
      paddingHorizontal: 12,
      paddingVertical: 15,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
    },
    avatar: {
      width: 35,
      height: 35,
      borderRadius: 72,
      marginRight: 8,
      marginLeft: 8,
    },
    chatName: {
      fontSize: 17,
      fontWeight: '600',
      width: 'auto',
      maxWidth: 200,
      color: theme.colors.base
    },
    icon: {
      backgroundColor: '#D9E5FC',
      width: 42,
      height: 42,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 72,
      marginRight: 8,
      marginLeft: 10,
    },
    chatMember: {
      marginTop: 2,
      color: theme.colors.baseShade1
    },
    chatIcon: {
      width: 24,
      height: 20,
      marginLeft: 8
    },
    settingIcon: {
      width: 26,
      height: 26,
      resizeMode: 'contain',
    },
    chatTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 4
    },
    sendIcon: {
      marginRight: 6,
      padding: 8,
    },
    IconCircle: {
      width: 50,
      height: 50,
      backgroundColor: theme.colors.secondary,
      borderRadius: 72,
      padding: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 7,
    },
    expandedArea: {
      height: 220,
      flexDirection: 'row',
      marginVertical: 15,
      backgroundColor: theme.colors.background,
    },
    iconText: {
      color: theme.colors.base
    },
    imageMessage: {
      resizeMode: 'cover',
      maxWidth: 350,
      maxHeight: 220,
      width: Dimensions.get('window').width / 2,
      height: Dimensions.get('window').width / 3,
      borderRadius: 10,
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 72,
      marginRight: 12,
    },
    leftMessageWrap: {
      flexDirection: 'row',
      marginVertical: 10,
    },
    rightMessageWrap: {
      marginVertical: 10,
    },
    loadingRow: {
      flexDirection: 'row',
      paddingHorizontal: 10,
    },
    loadingText: {
      marginRight: 13,
    },
    loadingImage: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    bubbleDivider: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      borderRadius: 20,
    },
    textDivider: {
      backgroundColor: theme.colors.border,
      borderRadius: 50,
      alignSelf: 'center',
      paddingHorizontal: 12,
      paddingVertical: 3,
      marginBottom: 6,
    },
    dateText: {
      color: theme.colors.base
    },
    optionsContainer: {
      backgroundColor: 'white', // Change the background color
      borderRadius: 10, // Add rounded corners
      padding: 10, // Add padding around the options container
      width: 80, // Set the width of the options container
      marginTop: -50, // Adjust the top margin as needed
    },

  });

  return styles;
}


