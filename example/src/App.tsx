import * as React from 'react';

import {
  AmityUiKitProvider,
  AmityUiKitChat,
} from '@amityco/react-native-chat-ui-kit';

export default function App() {
  const myTheme = {
    primary: '#04a179', // Primary color for main elements
    secondary: '#636878', // Secondary color UI elements e.g comment bubble, input bar
    background: '#1E1E1E', // Background color for components
    border: '#292B32', // Border color for elements, Date & time Divider
    base: '#FFFFFF', // Base color for main text, Title, input text
    baseShade1: '#EBECEF', // Base color for Sub Text, Sub Title, TimeStamp Text
    baseShade2: '#EBECEF', // Base color for comments, like text
    baseShade3: '#EBECEF', // Base color for placeHolder
    screenBackground: '#000000', // Background color for screens
    chatTopBar: '#1E1E1E', // Chat Top Bar background Color,
    chatBubbles: {
      userBubble: '#04a179',
      friendBubble: '#32343A',
    },
    chatMessageTexts: {
      userMessageText: '#FFFFFF',
      friendMessageText: '#FFFFFF'
    }
  };
  return (
    <AmityUiKitProvider
      apiKey="b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f"
      apiRegion="sg"
      userId="John"
      displayName="John"
      apiEndpoint="https://api.sg.amity.co"
      theme={myTheme}
      // darkMode

    >
      <AmityUiKitChat />
    </AmityUiKitProvider>
  );
}
