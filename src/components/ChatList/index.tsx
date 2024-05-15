/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import * as React from 'react';

import { View, TouchableHighlight, Image } from 'react-native';

import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import CustomText from '../CustomText';
import { useStyles } from './styles';
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
  const [oneOnOneChatObject, setOneOnOneChatObject] = useState<Amity.Membership<'channel'>[]>();
  const [groupChatObject, setGroupChatObject] = useState<Amity.Membership<'channel'>[]>();
  const [channelAvatarFileId, setChannelAvatarFileId] = useState<string | undefined>(avatarFileId)
  const [channelDisplayName, setChannelDisplayName] = useState<string>(chatName)

  const styles = useStyles();


  const handlePress = (
    chatMemberNumber: number
  ) => {
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
      if (chatReceiver.userId) {
        navigation.navigate('ChatRoom', {
          channelId: chatId,
          chatReceiver: chatReceiver,
        });
      }

    }
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

  };
  useEffect(() => {
    ChannelRepository.Membership.getMembers(
      { channelId: chatId },
      ({ data: members }) => {
        if (chatMemberNumber === 2 && members) {
          setOneOnOneChatObject(members);
        } else if (members) {
          setGroupChatObject(members);
        }
      },
    );
  }, [])

  useEffect(() => {
    if (oneOnOneChatObject) {
      const targetIndex: number = oneOnOneChatObject?.findIndex(
        (item) => item.userId !== (client as Amity.Client).userId
      );
      setChannelAvatarFileId(oneOnOneChatObject[targetIndex]?.user?.avatarFileId ?? avatarFileId)
      setChannelDisplayName(oneOnOneChatObject[targetIndex]?.user?.displayName as string)
    }
  }, [oneOnOneChatObject])


  return (

    <TouchableHighlight
      onPress={() => handlePress(chatMemberNumber)}
    >
      <View style={styles.chatCard}>
        <View style={styles.avatarSection}>


          {channelAvatarFileId ? <Image
            style={styles.icon}
            source={
              {
                uri: `https://api.${apiRegion}.amity.co/api/v3/files/${channelAvatarFileId}/download?size=small`,
              }
            }
          /> : <View style={styles.icon}>
            {channelType === 'community' ? <CommunityChatIcon />
              : <PrivateChatIcon />}

          </View>}

        </View>

        <View style={styles.chatDetailSection}>
          <View style={styles.chatNameWrap}>
            <CustomText style={styles.chatName} numberOfLines={1}>
              {channelDisplayName}
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
