import React, { ReactElement, useMemo, useRef } from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

import { ChannelRepository, getChannelTopic, subscribeTopic } from '@amityco/ts-sdk-react-native';
import ChatList, { IChatListProps, IGroupChatObject } from '../../components/ChatList/index';
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
  const { client, isConnected } = useAuth();

  const [channelObjects, setChannelObjects] = useState<IChatListProps[]>([]);
  const [loadChannel, setLoadChannel] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false)


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

    header: () => (
      <SafeAreaView style={styles.topBar}>
        <CustomText style={styles.titleText}>Chat</CustomText>
        <TouchableOpacity
          onPress={() => {
            setIsModalVisible(true)
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
    const unsubscribe = ChannelRepository.getChannels(
      { sortBy: 'lastActivity', limit: 10, membership: 'member' },
      (value) => {
        setChannelData(value);
        subscribeChannels(channels);
        if(value.data.length === 0){
          setLoadChannel(false);
        }
      },
    );
    disposers.push(unsubscribe);
  };
  useEffect(() => {
    onQueryChannel();
    return () => {
      disposers.forEach(fn => fn());
    };
  }, [isConnected]);


  useEffect(() => {
    if (channels.length > 0) {
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
  }, [channelData]);

  const handleLoadMore = () => {
    if (hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false)
  }

  const handleOnFinish = async (users: UserInterface[]) => {
    const channel = await createAmityChannel((client as Amity.Client).userId as string, users)
    if (channel) {
      try {
        if (users.length === 1 && users[0]) {
          const oneOnOneChatObject: UserInterface = {
            userId: users[0].userId,
            displayName: users[0].displayName as string,
            avatarFileId: users[0].avatarFileId as string,
          };

          navigation.navigate('ChatRoom', {
            channelId: channel.channelId,
            chatReceiver: oneOnOneChatObject,
          });

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
          const groupChatObject: IGroupChatObject = {
            displayName: chatDisplayName.join(','),
            users: userObject,
            memberCount: channel.memberCount as number,
            avatarFileId: channel.avatarFileId
          };
          console.log('groupChatObject: ', groupChatObject);


          navigation.navigate('ChatRoom', {
            channelId: channel.channelId,
            groupChat: groupChatObject,
          });

        }

        console.log('create chat success ' + JSON.stringify(channel));
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
    <View style={styles.chatContainer}>
      {renderTabView()}
      {renderRecentChat}
      <AddMembersModal onFinish={handleOnFinish} onClose={handleCloseModal} visible={isModalVisible} />
    </View>
  );
}
