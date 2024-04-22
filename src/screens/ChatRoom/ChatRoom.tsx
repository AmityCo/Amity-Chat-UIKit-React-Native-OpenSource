/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Image,
  LogBox,
  TouchableOpacity,
  TextInput,
  Platform,
  Text,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import CustomText from '../../components/CustomText';
import { useStyles } from './styles';
import { type RouteProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../routes/RouteParamList';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/BackButton';
import moment from 'moment';
import {
  MessageContentType,
  MessageRepository,
  SubChannelRepository,
  getSubChannelTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingImage from '../../components/LoadingImage';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { SvgXml } from 'react-native-svg';
import { deletedIcon } from '../../svg/svg-xml-list';
import EditMessageModal from '../../components/EditMessageModal';
import { GroupChatIcon } from '../../svg/GroupChatIcon';
import { AvatarIcon } from '../../svg/AvatarIcon';
import { CameraBoldIcon } from '../../svg/CameraBoldIcon';
import { MenuIcon } from '../../svg/MenuIcon';
import { PlusIcon } from '../../svg/PlusIcon';
import { SendChatIcon } from '../../svg/SendChatIcon';
import { AlbumIcon } from '../../svg/AlbumIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';

type ChatRoomScreenComponentType = React.FC<{
  route: RouteProp<RootStackParamList, 'ChatRoom'>;
  navigation: StackNavigationProp<RootStackParamList, 'ChatRoom'>;
}>;
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

interface IMessage {
  _id: string;
  text?: string;
  createdAt: string;
  editedAt: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  image?: string;
  messageType: string;
  isPending?: boolean;
  isDeleted: boolean;
}
export interface IDisplayImage {
  url: string;
  fileId: string | undefined;
  fileName: string;
  isUploaded: boolean;
  thumbNail?: string;
}
const ChatRoom: ChatRoomScreenComponentType = ({ route }) => {

  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { chatReceiver, groupChat, channelId } = route.params;

  const { client, apiRegion } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagesData, setMessagesData] = useState<Amity.LiveCollection<Amity.Message>>();
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const theme = useTheme() as MyMD3Theme;

  const {
    data: messagesArr = [],
    onNextPage,
    hasNextPage,
  } = messagesData ?? {};

  const [inputMessage, setInputMessage] = useState('');
  const [sortedMessages, setSortedMessages] = useState<IMessage[]>([]);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [fullImage, setFullImage] = useState<string>('');
  const [subChannelData, setSubChannelData] = useState<Amity.SubChannel>();
  const [displayImages, setDisplayImages] = useState<IDisplayImage[]>([]);
  const [editMessageModal, setEditMessageModal] = useState<boolean>(false)
  const [editMessageId, setEditMessageId] = useState<string>('');
  const [editMessageText, setEditMessageText] = useState<string>('');
  const disposers: Amity.Unsubscriber[] = [];


  const subscribeSubChannel = (subChannel: Amity.SubChannel) =>
    disposers.push(subscribeTopic(getSubChannelTopic(subChannel)));


  useEffect(() => {
    if (channelId) {
      SubChannelRepository.getSubChannel(
        channelId,
        ({ data: subChannel }) => {
          setSubChannelData(subChannel);
        }
      );
    }
    return () => {
      disposers.forEach((fn) => fn());
      stopRead()
    }
  }, [channelId]);


  const startRead = async () => {
    await SubChannelRepository.startReading(channelId);

  };
  const stopRead = async () => {
    await SubChannelRepository.stopReading(channelId);

  };
  const markReadMessage = (message: Amity.Message) => {
    // Mark a message as read
    message.markRead();
  };
  useEffect(() => {
    if (subChannelData && channelId) {
      startRead()
      const unsubscribe = MessageRepository.getMessages(
        { subChannelId: channelId, limit: 10, includeDeleted: true },
        (value) => {
          setMessagesData(value);
          subscribeSubChannel(subChannelData as Amity.SubChannel);

        },
      );
      disposers.push(() => unsubscribe);
    }
  }, [subChannelData]);

  useEffect(() => {
    if (messagesArr.length > 0) {
      markReadMessage(messagesArr[messagesArr.length - 1] as Amity.Message)
      const formattedMessages = messagesArr.map((item) => {
        const targetIndex: number | undefined =
          groupChat &&
          groupChat.users?.findIndex(
            (groupChatItem) => item.creatorId === groupChatItem.userId
          );
        let avatarUrl = '';
        if (
          groupChat &&
          targetIndex &&
          (groupChat?.users as any)[targetIndex as number]?.avatarFileId
        ) {
          avatarUrl = `https://api.${apiRegion}.amity.co/api/v3/files/${(groupChat?.users as any)[targetIndex as number]
            ?.avatarFileId as any
            }/download`;
        } else if (chatReceiver && chatReceiver.avatarFileId) {
          avatarUrl = `https://api.${apiRegion}.amity.co/api/v3/files/${chatReceiver.avatarFileId}/download`;
        }

        if ((item?.data as Record<string, any>)?.fileId) {
          return {
            _id: item.messageId,
            text: '',
            image:
              `https://api.${apiRegion}.amity.co/api/v3/files/${(item?.data as Record<string, any>).fileId
              }/download` ?? undefined,
            createdAt: item.createdAt as string,
            editedAt: item.updatedAt as string,
            user: {
              _id: item.creatorId ?? '',
              name: item.creatorId ?? '',
              avatar: avatarUrl,
            },
            messageType: item.dataType,
            isDeleted: item.isDeleted as boolean
          };
        } else {
          return {
            _id: item.messageId,
            text:
              ((item?.data as Record<string, string>)?.text as string) ?? '',
            createdAt: item.createdAt as string,
            editedAt: item.updatedAt as string,
            user: {
              _id: item.creatorId ?? '',
              name: item.creatorId ?? '',
              avatar: avatarUrl,
            },
            messageType: item.dataType,
            isDeleted: item.isDeleted as boolean
          };
        }
      });
      setMessages(formattedMessages);
    }
  }, [messagesArr]);

  const handleSend = async () => {
    if (inputMessage.trim() === '') {
      return;
    }
    Keyboard.dismiss();

    const textMessage = {
      subChannelId: channelId,
      dataType: MessageContentType.TEXT,
      data: {
        text: inputMessage,
      },
    };

    const { data: message } = await MessageRepository.createMessage(textMessage);
    if (message) {
      setInputMessage('');
      scrollToBottom();
    }
  };

  function handleBack(): void {
    disposers.forEach((fn) => fn());
    stopRead()
  }

  const loadNextMessages = () => {
    if (flatListRef.current && hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  useEffect(() => {
    const sortedMessagesData: IMessage[] = messages.sort((x, y) => {
      return new Date(x.createdAt) < new Date(y.createdAt) ? 1 : -1;
    });
    const reOrderArr = sortedMessagesData;
    setSortedMessages([...reOrderArr]);
  }, [messages]);

  const openFullImage = (image: string, messageType: string) => {
    if (messageType === 'image' || messageType === 'file') {
      const fullSizeImage: string = image + '?size=full';
      setFullImage(fullSizeImage);
      setIsVisibleFullImage(true);
    }

  };

  const renderTimeDivider = (date: string) => {
    const currentDate = date;
    const formattedDate = moment(currentDate).format('MMMM DD, YYYY');
    const today = moment().startOf('day');

    let displayText = formattedDate;

    if (moment(currentDate).isSame(today, 'day')) {
      displayText = 'Today';
    }

    return (
      <View style={styles.bubbleDivider}>
        <View style={styles.textDivider}>
          <Text style={styles.dateText} >
            {displayText}
          </Text>
        </View>
      </View>
    );
  };

  const deleteMessage = async (messageId: string) => {
    const message = await MessageRepository.softDeleteMessage(messageId);
    return message

  }

  const reportMessage = async (messageId: string) => {
    const isFlagged = await MessageRepository.flagMessage(messageId);
    if (isFlagged) {
      Alert.alert('Report sent ✅')
    }

  }


  const renderChatMessages = (message: IMessage, index: number) => {

    const isUserChat: boolean =
      message?.user?._id === (client as Amity.Client).userId;
    let isRenderDivider = false
    const messageDate = moment(message.createdAt)

    const previousMessageDate = moment(sortedMessages[index + 1]?.createdAt)
    const isSameDay = messageDate.isSame(previousMessageDate, 'day');

    if (!isSameDay || index === sortedMessages.length - 1) {
      isRenderDivider = true
    }

    return (

      <View>
        {isRenderDivider && renderTimeDivider(message.createdAt)}
        <View
          style={!isUserChat ? styles.leftMessageWrap : styles.rightMessageWrap}
        >
          {!isUserChat && (
            message.user.avatar ?
              <Image
                source={
                  { uri: message.user.avatar }

                }
                style={styles.avatarImage}
              /> : <View style={styles.avatarImage} ><AvatarIcon /></View>
          )}

          <View>
            {!isUserChat && (
              <Text
                style={isUserChat ? styles.chatUserText : styles.chatFriendText}
              >
                {message.user.name}
              </Text>
            )}
            {message.isDeleted ?
              <View style={[
                styles.deletedMessageContainer,
                isUserChat ? styles.userMessageDelete : styles.friendMessageDelete,
              ]}>
                <View style={styles.deletedMessageRow}>
                  <SvgXml xml={deletedIcon} width={20} height={20} />
                  <Text style={styles.deletedMessage}>Message Deleted</Text>
                </View>
              </View>

              : <Menu>
                <MenuTrigger onAlternativeAction={() => openFullImage(message.image as string, message.messageType)} customStyles={{ triggerTouchable: { underlayColor: 'transparent' } }} triggerOnLongPress>
                  {message.messageType === 'text' ? (
                    <View
                      key={message._id}
                      style={[
                        styles.textChatBubble,
                        isUserChat ? styles.userBubble : styles.friendBubble,
                      ]}
                    >
                      <Text
                        style={isUserChat ? styles.chatUserText : styles.chatFriendText}
                      >
                        {message.text}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.imageChatBubble,
                        isUserChat ? styles.userImageBubble : styles.friendBubble,
                      ]}
                    >

                      <Image
                        style={styles.imageMessage}
                        source={{
                          uri: message.image + '?size=medium',
                        }}
                      />
                    </View>
                  )}
                </MenuTrigger>
                <MenuOptions customStyles={{ optionsContainer: { ...styles.optionsContainer, marginLeft: isUserChat ? 240 + ((message.text && message.text.length < 5) ? message.text.length * 10 : 10) : 0 } }}>
                  {isUserChat ? <MenuOption onSelect={() => Alert.alert('Delete this message?', `Message will be also be permanently removed from your friend's devices.`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(message._id) },
                  ])} text="Delete" /> : <MenuOption onSelect={() => reportMessage(message._id)} text="Report" />}
                  {(message.messageType === 'text' && isUserChat) && <MenuOption onSelect={() => { return openEditMessageModal(message._id, message.text as string) }} text="Edit" />}

                </MenuOptions>

              </Menu>}
            <Text
              style={[
                styles.chatTimestamp,
                {
                  alignSelf: isUserChat ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              {message.createdAt != message.editedAt ? 'Edited ·' : ''} {moment(message.createdAt).format('hh:mm A')}
            </Text>


          </View>
        </View>
      </View>


    );
  };
  const handlePress = () => {
    Keyboard.dismiss();
    setIsExpanded(!isExpanded);
  };
  const scrollToBottom = () => {
    if (flatListRef && flatListRef.current) {
      (flatListRef.current as Record<string, any>).scrollToOffset({
        animated: true,
        offset: 0,
      });
    }
  };
  const handleOnFocus = () => {
    setIsExpanded(false);
  };



  const pickCamera = async () => {
    // No permissions request is necessary for launching the image library
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result: ImagePicker.ImagePickerResult =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
          base64: false
        });

      if (
        result.assets &&
        result.assets.length > 0 &&
        result.assets[0] !== null &&
        result.assets[0]
      ) {
        const selectedImages = result.assets;
        const imageUriArr: string[] = selectedImages.map((item: { uri: string; }) => item.uri);
        const imagesArr = [...imageMultipleUri];
        const totalImages = imagesArr.concat(imageUriArr);
        setImageMultipleUri(totalImages);
        // do something with uri
      }
    }

  };


  const createImageMessage = async (fileId: string) => {

    if (fileId) {

      const imageMessage = {
        subChannelId: channelId,
        dataType: MessageContentType.IMAGE,
        fileId: fileId,
      };
      await MessageRepository.createMessage(imageMessage);


    }
  };

  const handleOnFinishImage = async (
    fileId: string,
    originalPath: string
  ) => {
    createImageMessage(fileId)
    setTimeout(() => {
      setDisplayImages((prevData) => {
        const newData: IDisplayImage[] = prevData.filter((item: IDisplayImage) => item.url !== originalPath); // Filter out objects containing the desired value
        return newData; // Update the state with the filtered array
      });
      setImageMultipleUri((prevData) => {
        const newData = prevData.filter((url: string) => url !== originalPath); // Filter out objects containing the desired value
        return newData; // Update the state with the filtered array
      });
    }, 0);

  };

  useEffect(() => {
    if (imageMultipleUri.length > 0 && displayImages.length === 0) {
      const imagesObject: IDisplayImage[] = imageMultipleUri.map(
        (url: string) => {
          const fileName: string = url.substring(url.lastIndexOf('/') + 1);

          return {
            url: url,
            fileName: fileName,
            fileId: '',
            isUploaded: false,
          };
        }
      );
      setDisplayImages([imagesObject[0]] as IDisplayImage[]);
    }

  }, [imageMultipleUri]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
      base64: false
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImages = result.assets;
      const imageUriArr: string[] = selectedImages.map((item: { uri: string; }) => item.uri);
      const imagesArr = [...imageMultipleUri];
      const totalImages = imagesArr.concat(imageUriArr);
      setImageMultipleUri(totalImages);
    }
  };
  const renderLoadingImages = useMemo(() => {
    return (
      <View style={styles.loadingImage}>
        <FlatList
          keyExtractor={(item, index) => item.fileName + index}
          data={displayImages}
          renderItem={({ item, index }) => (
            <LoadingImage
              source={item.url}
              index={index}
              onLoadFinish={handleOnFinishImage}
              isUploaded={item.isUploaded}
              fileId={item.fileId}
            />
          )}
          scrollEnabled={false}
          numColumns={1}
        />
      </View>
    );
  }, [displayImages, handleOnFinishImage]);

  const openEditMessageModal = (messageId: string, text: string) => {
    setEditMessageId(messageId)
    setEditMessageModal(true)
    setEditMessageText(text)
  }

  const closeEditMessageModal = () => {
    setEditMessageId('')
    setEditMessageText('')
    setEditMessageModal(false)
  }


  return (


    <View style={styles.container}>
      <SafeAreaView style={styles.topBarContainer} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.chatTitleWrap}>
            <TouchableOpacity onPress={handleBack}>
              <BackButton onPress={handleBack} />
            </TouchableOpacity>

            {chatReceiver ? (
              chatReceiver?.avatarFileId ?
                <Image
                  style={styles.avatar}
                  source={
                    {
                      uri: `https://api.${apiRegion}.amity.co/api/v3/files/${chatReceiver?.avatarFileId}/download`,
                    }

                  }
                /> : <View style={styles.avatar}>
                  <AvatarIcon />
                </View>
            ) : groupChat?.avatarFileId ? (
              <Image
                style={styles.avatar}
                source={{
                  uri: `https://api.${apiRegion}.amity.co/api/v3/files/${groupChat?.avatarFileId}/download`,
                }}
              />
            ) : (
              <View style={styles.icon}>
                <GroupChatIcon />
              </View>
            )}
            <View>
              <CustomText style={styles.chatName} numberOfLines={1}>
                {chatReceiver
                  ? chatReceiver?.displayName
                  : groupChat?.displayName}
              </CustomText>
              {groupChat && (
                <CustomText style={styles.chatMember}>
                  {groupChat?.memberCount} members
                </CustomText>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChatDetail', { channelId: channelId, channelType: chatReceiver ? 'conversation' : 'community', chatReceiver: chatReceiver ?? undefined, groupChat: groupChat ?? undefined });
            }}
          >
            <MenuIcon color={theme.colors.base} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={styles.chatContainer}>
        <FlatList
          data={sortedMessages}
          renderItem={({ item, index }) => renderChatMessages(item, index)}
          keyExtractor={(item) => item._id}
          onEndReached={loadNextMessages}
          onEndReachedThreshold={0.5}
          inverted
          ref={flatListRef}
          ListHeaderComponent={renderLoadingImages}
        />

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.select({ ios: 110, android: 100 })}
        style={styles.AllInputWrap}
      >
        <View style={styles.InputWrap}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={(text) => setInputMessage(text)}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.baseShade3}
            onFocus={handleOnFocus}

          />

          {inputMessage.length > 0 ? (
            <TouchableOpacity onPress={handleSend} style={styles.sendIcon}>
              <SendChatIcon color={theme.colors.primary} />
            </TouchableOpacity>
          ) : (
            <View>

              <TouchableOpacity onPress={handlePress} style={styles.sendIcon}>
                <PlusIcon color={theme.colors.base} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {isExpanded && (
          <View style={styles.expandedArea}>
            <TouchableOpacity
              onPress={pickCamera}
              style={{ marginHorizontal: 30 }}
            >
              <View style={styles.IconCircle}>
                <CameraBoldIcon color={theme.colors.base} />
              </View>
              <CustomText style={styles.iconText}>Camera</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              // disabled={loadingImages.length > 0}
              onPress={pickImage}
              style={{ marginHorizontal: 20, alignItems: 'center' }}
            >
              <View style={styles.IconCircle}>
                <AlbumIcon color={theme.colors.base} />
              </View>
              <CustomText style={styles.iconText}>Album</CustomText>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      <ImageView
        images={[{ uri: fullImage }]}
        imageIndex={0}
        visible={visibleFullImage}
        onRequestClose={() => setIsVisibleFullImage(false)}
      />
      <EditMessageModal
        visible={editMessageModal}
        onClose={closeEditMessageModal}
        messageText={editMessageText}
        onFinishEdit={closeEditMessageModal}
        messageId={editMessageId}
      />
    </View>

  );
};
export default ChatRoom;
