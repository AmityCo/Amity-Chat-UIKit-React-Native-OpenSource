import React, { ReactElement, useCallback, useMemo, useRef } from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

import { ChannelRepository, getChannelTopic, subscribeTopic } from '@amityco/ts-sdk';
import ChatList, { IChatListProps, IGroupChatObject, IUserObject } from '../../components/ChatList/index';
import useAuth from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import moment from 'moment';

import styles from './styles';
import CustomText from '../../components/CustomText';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import LoadingIndicator from '../../components/LoadingIndicator/index';
import AddMembersModal from '../../components/AddMembersModal';
import type { UserInterface } from '../../types/user.interface';
import { createAmityChannel } from '../../providers/channel-provider';
export default function RecentChat() {
  const { isConnected, client } = useAuth();

  const [channelObjects, setChannelObjects] = useState<IChatListProps[]>([]);
  const [loadChannel, setLoadChannel] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([])
  const [isRefresh, setIsRefresh] = useState<boolean>(false)
  console.log('selectedUserIds:', selectedUsers)
  // const [unSubFunc, setUnSubFunc] = useState<any>();

  const flatListRef = useRef(null);

  const [channelData, setChannelData] = useState<Amity.LiveCollection<Amity.Channel>>();

  const {
    data: channels = [],
    onNextPage,
    hasNextPage,
  } = channelData ?? {};
  const disposers: Amity.Unsubscriber[] = [];
  const subscribedChannels: Amity.Channel['channelId'][] = [];

  const subscribeChannels = (channels: Amity.Channel[]) =>
    channels.forEach(c => {
      if (!subscribedChannels.includes(c.channelId) && !c.isDeleted) {
        subscribedChannels.push(c.channelId);

        disposers.push(subscribeTopic(getChannelTopic(c)));
      }
    });


  const navigation = useNavigation<NativeStackNavigationProp<any>>();
 
  navigation.setOptions({
    // eslint-disable-next-line react/no-unstable-nested-components
    header: () => (
      <SafeAreaView style={styles.topBar}>
        <CustomText style={styles.titleText}>Chat</CustomText>
        <TouchableOpacity
          onPress={() => {
            setIsModalVisible(true)
            // navigation.navigate('SelectMembers');
          }}
        >
          <Image
            style={styles.addChatIcon}
            source={require('../../../assets/icon/addChat.png')}
          />
        </TouchableOpacity>
      </SafeAreaView>
    ),
    headerTitle: '',
  });

  const onQueryChannel = () => {
    setIsRefresh(true)
    const unsubscribe = ChannelRepository.getChannels(
      { sortBy: 'lastActivity', limit: 10, membership: 'member' },
      (value) => {
        setChannelData(value);
        subscribeChannels(channels);
        setIsRefresh(false)
      },
    );
    disposers.push(unsubscribe);
    // setUnSubFunc(() => unsubscribe);
  };
  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        onQueryChannel();
      }, 700);

    }

    return () => {
      disposers.forEach(fn => fn());
    };
  }, [isConnected]);
  console.log('isConnected:', isConnected)

  useEffect(() => {
    if (channels.length > 0) {
      // console.log('channels:', channels)
      const formattedChannelObjects: IChatListProps[] = channels.map(
        (item: Amity.Channel<any>) => {
          const lastActivityDate: string = moment(item.lastActivity).format(
            'DD/MM/YYYY'
          );
          const todayDate = moment(Date.now()).format('DD/MM/YYYY');
          let dateDisplay;
          if (lastActivityDate === todayDate) {
            dateDisplay = moment(item.lastActivity).format('hh:mm A');
          } else {
            dateDisplay = moment(item.lastActivity).format('DD/MM/YYYY');
          }

          return {
            chatId: item.channelId ?? '',
            chatName: item.displayName ?? '',
            chatMemberNumber: item.memberCount ?? 0,
            unReadMessage: item.unreadCount ?? 0,
            messageDate: dateDisplay ?? '',
            channelType: item.type ?? '',
            avatarFileId: item.avatarFileId,
          };
        }
      );
      setChannelObjects([...formattedChannelObjects]);
      setLoadChannel(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLoadMore = () => {
    if (hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false)
  }

  const handleOnFinish = async (users: UserInterface[]) => {

    setSelectedUsers(users)
    const channel = await createAmityChannel((client as Amity.Client).userId as string, users)
    if (channel) {
      console.log('channelId:', channel)
      try {
        if (users.length === 1 && users[0]) {
          const oneOnOneChatObject = {
            userId: users[0].userId,
            displayName: users[0].displayName as string,
            avatarFileId: users[0].avatarFileId as string,
          };
          // navigation.goBack();
          // setTimeout(() => {
          //   navigation.navigate('ChatRoom', {
          //     channelId: channel.channelId,
          //     chatReceiver: oneOnOneChatObject,
          //   });
          // }, 500);
        } else if (users.length > 1) {
          const chatDisplayName = users.map(
            (item) => item.displayName
          );
          const userObject = users.map((item: UserInterface) => {
            return {
              userId: item.userId,
              displayName: item.displayName,
              avatarFileId: item.avatarFileId,
            };
          });
          const groupChatObject = {
            chatDisplayName: chatDisplayName.join(','),
            users: userObject,
          };
          console.log('groupChatObject: ', groupChatObject);
          // navigation.goBack();
          // setTimeout(() => {
          //   navigation.navigate('ChatRoom', {
          //     channelId: channel.channelId,
          //     chatReceiver: groupChatObject,
          //   });
          // }, 500);
        }
  
        console.log('create chat success ' + JSON.stringify( channel));
      } catch (error) {
        console.log('create chat error ' + JSON.stringify(error));
        console.error(error);
      }

    }
  }
  const renderRecentChat = useMemo(() => {
    return loadChannel ? (
      <View style={{ marginTop: 20 }}>
        <LoadingIndicator />
      </View>
    ) : (
      <View>
        <FlatList
          data={channelObjects}
          renderItem={({ item }) => renderChatList(item)}
          keyExtractor={(item) => item.chatId.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ref={flatListRef}
          contentContainerStyle={{ flexGrow: 1 }}
          onRefresh={onQueryChannel}
          refreshing={isRefresh}
        />
      </View>
    );
  }, [loadChannel, channelObjects, handleLoadMore]);
  const renderChatList = (item: IChatListProps): ReactElement => {
    return (
      <ChatList
        key={item.chatId}
        chatId={item.chatId}
        chatName={item.chatName}
        chatMemberNumber={item.chatMemberNumber}
        unReadMessage={item.unReadMessage}
        messageDate={item.messageDate}
        channelType={item.channelType}
        avatarFileId={item.avatarFileId}
      />
    );
  };
  const renderTabView = (): ReactElement => {
    return (
      <View style={[styles.tabView]}>
        <View style={styles.indicator}>
          <CustomText style={styles.tabViewTitle}>Recent</CustomText>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderTabView()}
      {renderRecentChat}
      <AddMembersModal onFinish={handleOnFinish} onClose={handleCloseModal} visible={isModalVisible} />
    </View>
  );
}
