import * as React from 'react';

import AuthContextProvider from './auth-provider';
import { MenuProvider } from 'react-native-popup-menu';
import { DefaultTheme, type MD3Theme, PaperProvider } from 'react-native-paper';
export interface IAmityUIkitProvider {
  userId: string;
  displayName: string;
  apiKey: string;
  apiRegion?: string;
  apiEndpoint?: string;
  children: any;
  theme?: CustomColors
  darkMode?: boolean
  authToken?: string
}

interface CustomColors {
  primary?: string;
  secondary?: string;
  background?: string;
  border?: string;
  base?: string;
  baseShade1?: string;
  baseShade2?: string;
  baseShade3?: string;
  chatTopBar?: string;
  screenBackground?: string;
  chatBubbles?: { userBubble: string; friendBubble: string };
  chatMessageTexts?: { userMessageText: string; friendMessageText: string };

}
export interface MyMD3Theme extends MD3Theme {
  colors: MD3Theme['colors'] & CustomColors;
}
export default function AmityUiKitProvider({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
  theme,
  authToken,
  darkMode = false
}: IAmityUIkitProvider) {


  const customizedTheme: MyMD3Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme?.primary ?? '#1054DE',
      secondary: theme?.secondary ?? '#EBECEF',
      background: theme?.background ?? '#FFFFFF',
      border: theme?.border ?? '#EBECEF',
      base: theme?.base ?? '#292B32',
      baseShade1: theme?.baseShade1 ?? '#636878',
      baseShade2: theme?.baseShade2 ?? '#898E9E',
      baseShade3: theme?.baseShade3 ?? '#A5A9B5',
      screenBackground: theme?.screenBackground ?? '#F9F9FA',
      chatBubbles: {
        userBubble: theme?.chatBubbles?.userBubble ?? '#1054DE',
        friendBubble: theme?.chatBubbles?.friendBubble ?? '#EBECEF',
      },
      chatMessageTexts: {
        userMessageText: theme?.chatMessageTexts?.userMessageText ?? '#FFFFFF',
        friendMessageText: theme?.chatMessageTexts?.friendMessageText ?? '#292B32',
      },
      chatTopBar: theme?.chatTopBar ?? '#FFFFFF',
    },
  };

  const defaultDarkTheme: MyMD3Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme?.primary ?? '#1054DE',      // Primary color for main elements
      secondary: theme?.secondary ?? '#292B32',    // Secondary color UI elements e.g comment bubble, input bar 
      background: theme?.background ?? '#191919',   // Background color for the overall theme
      border: theme?.border ?? '#292B32',       // Border color for elements
      base: theme?.base ?? '#FFFFFF',         // Base color for main text, Title, input text 
      baseShade1: theme?.baseShade1 ?? '#EBECEF',   // Base color for Sub Text, Sub Title, TimeStamp Text
      baseShade2: theme?.baseShade2 ?? '#EBECEF',   // Base color for comments, like text
      baseShade3: theme?.baseShade3 ?? '#EBECEF',   // Base color for placeHolder
      screenBackground: theme?.screenBackground ?? '#000000',
      chatBubbles: {
        userBubble: theme?.chatBubbles?.userBubble ?? '#1054DE',
        friendBubble: theme?.chatBubbles?.friendBubble ?? '#32343A',
      },
      chatMessageTexts: {
        userMessageText: theme?.chatMessageTexts?.userMessageText ?? '#FFFFFF',
        friendMessageText: theme?.chatMessageTexts?.friendMessageText ?? '#292B32',
      },
      chatTopBar: theme?.chatTopBar ?? '#292B32',
    },
  };

  return (
    <AuthContextProvider
      userId={userId}
      displayName={displayName || userId}
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
      authToken={authToken}
    >
      <PaperProvider theme={darkMode ? defaultDarkTheme : customizedTheme}>
        <MenuProvider>
          {children}
        </MenuProvider>
      </PaperProvider>
    </AuthContextProvider >

  );
}
