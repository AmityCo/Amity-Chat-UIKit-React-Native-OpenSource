/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import * as React from 'react';

import { View, TouchableHighlight, Image } from 'react-native';

import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import CustomText from '../CustomText';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAuth from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { UserInterface } from '../../types/user.interface';
import { CommunityChatIcon } from '../../svg/CommunityChatIcon';
import { PrivateChatIcon } from '../../svg/PrivateChatIcon';
export interface IChatListProps {
  chatId: string;
  chatName: string;
  chatMemberNumber: number;
  unReadMessage: number;
  messageDate: string;
  channelType: 'conversation' | 'broadcast' | 'live' | 'community' | '';
  avatarFileId: string | undefined;
}

export interface IGroupChatObject {
  displayName: string;
  memberCount: number;
  users: UserInterface[];
  avatarFileId: string | undefined;
}
const ChatList: React.FC<IChatListProps> = ({
  chatId,
  chatName,
  chatMemberNumber,
  unReadMessage,
  messageDate,
  channelType,
  avatarFileId,
}: IChatListProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { client, apiRegion } = useAuth();
  const [oneOnOneChatObject, setOneOnOneChatObject] =
    useState<Amity.Membership<'channel'>[]>();
  const [groupChatObject, setGroupChatObject] =
    useState<Amity.Membership<'channel'>[]>();

  const handlePress = (
    channelId: string,
    channelType: string,
    chatMemberNumber: number
  ) => {
    console.log('type:' + channelType);

    ChannelRepository.Membership.getMembers(
      { channelId },
      ({ data: members }) => {
        if (chatMemberNumber === 2 && members) {
          setOneOnOneChatObject(members);
        } else if (members) {
          setGroupChatObject(members);
        }
      },
    );

  };

  useEffect(() => {
    if (oneOnOneChatObject) {
      const targetIndex: number = oneOnOneChatObject?.findIndex(
        (item) => item.userId !== (client as Amity.Client).userId
      );
      const chatReceiver: UserInterface = {
        userId: oneOnOneChatObject[targetIndex]?.userId as string,
        displayName: oneOnOneChatObject[targetIndex]?.user
          ?.displayName as string,
        avatarFileId: oneOnOneChatObject[targetIndex]?.user?.avatarFileId ?? '',
      };

      navigation.navigate('ChatRoom', {
        channelId: chatId,
        chatReceiver: chatReceiver,
      });
    }
  }, [oneOnOneChatObject]);

  useEffect(() => {
    if (groupChatObject) {
      const userArr: UserInterface[] = groupChatObject?.map((item) => {
        return {
          userId: item.userId as string,
          displayName: item.user?.displayName as string,
          avatarFileId: item.user?.avatarFileId as string,
        };
      });

      const groupChat: IGroupChatObject = {
        users: userArr,
        displayName: chatName as string,
        avatarFileId: avatarFileId,
        memberCount: chatMemberNumber,
      };
      navigation.navigate('ChatRoom', {
        channelId: chatId,
        groupChat: groupChat,
      });
    }
  }, [groupChatObject]);

  return (

    <TouchableHighlight
      onPress={() => handlePress(chatId, channelType, chatMemberNumber)}
    >
      <View style={styles.chatCard}>
        <View style={styles.avatarSection}>
      

          {avatarFileId ? <Image
            style={styles.icon}
            source={
              {
                uri: `https://api.${apiRegion}.amity.co/api/v3/files/${avatarFileId}/download?size=small`,
              }
            }
          /> : <View style={styles.icon}>
            {channelType === 'community' ? <CommunityChatIcon /> : <PrivateChatIcon />}

          </View>}

        </View>

        <View style={styles.chatDetailSection}>
          <View style={styles.chatNameWrap}>
            <CustomText style={styles.chatName} numberOfLines={1}>
              {chatName}
            </CustomText>
            <CustomText style={styles.chatLightText}>
              ({chatMemberNumber})
            </CustomText>
          </View>
          <View style={styles.chatTimeWrap}>
            <CustomText style={styles.chatLightText}>{messageDate}</CustomText>
            {unReadMessage > 0 && (
              <View style={styles.unReadBadge}>
                <CustomText style={styles.unReadText}>
                  {unReadMessage}
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
};
export default ChatList;
