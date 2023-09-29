import * as React from 'react';
import { useState } from 'react';
// import { useTranslation } from 'react-i18next';

import { View, Button, TextInput } from 'react-native';
import { SessionState } from '../enum/sessionState';
import useAuth from '../hooks/useAuth';

export default function Home({ navigation }: any) {
  // const { t, i18n } = useTranslation();
  const { client } = useAuth();
  const clickLogin = () => {
  };
  const clickChatDetail = () => {
    navigation.navigate('ChatDetail');
  };
  const checkLogin = () => {

    if (
      (client as Amity.Client).sessionState ===
      (SessionState.established as string)
    ) {
      navigation.navigate('SelectMembers');
    }
  };
  const checkLogin2 = () => {

    if (
      (client as Amity.Client).sessionState ===
      (SessionState.established as string)
    ) {
      navigation.navigate('RecentChat');
    }
  };
  const chatRoom = () => {

    if (
      (client as Amity.Client).sessionState ===
      (SessionState.established as string)
    ) {
      navigation.navigate('ChatRoom', {
        channelId: '6421a2f271dfbc6449a99886',
      });
    }
  };
  const [inputText, setInputText] = useState<string>('');
  return (
    <View>

      <Button title="Login" onPress={clickLogin} />
      <Button title="Recent Chat" onPress={checkLogin2} />

      <Button title="Check isConnect" onPress={checkLogin} />
      <TextInput
        value={inputText}
        onChangeText={(value) => setInputText(value)}
        placeholder="Type userId"
        multiline
      />
      <Button title="Chat Detail" onPress={clickChatDetail} />
      <Button title="Chat Room test" onPress={chatRoom} />
      {/* <ChatList/> */}
    </View>
  );
}
