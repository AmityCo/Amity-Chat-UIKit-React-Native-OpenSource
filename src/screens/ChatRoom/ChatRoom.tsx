/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import CustomText from '../../components/CustomText';
import styles from './styles';
import { RouteProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../routes/RouteParamList';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/BackButton';
import moment from 'moment';
import {
  FileRepository,
  MessageContentType,
  MessageRepository,
  SubChannelRepository,
  getSubChannelTopic,
  subscribeTopic,
} from '@amityco/ts-sdk';
import useAuth from '../../hooks/useAuth';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Action } from '../EditChatDetail/EditChatRoomDetail';
import { uploadFile } from '../../providers/file-provider';
import LoadingIndicator from '../../components/LoadingIndicator';
import LoadingImage from '../../components/LoadingImage';
type ChatRoomScreenComponentType = React.FC<{
  route: RouteProp<RootStackParamList, 'ChatRoom'>;
  navigation: StackNavigationProp<RootStackParamList, 'ChatRoom'>;
}>;
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

interface IMessage {
  _id: string;
  text?: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  image?: string;
  messageType: string;
  isPending?: boolean;
}
export interface IDisplayImage {
  url: string;
  fileId: string | undefined;
  fileName: string;
  isUploaded: boolean;
  thumbNail?: string;
}
const ChatRoom: ChatRoomScreenComponentType = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { chatReceiver, groupChat, channelId } = route.params;
  console.log('groupChat:', groupChat)
  const { client } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagesData, setMessagesData] =
    useState<Amity.LiveCollection<Amity.Message>>();
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  console.log('imageMultipleUri:', imageMultipleUri)
  // const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const {
    data: messagesArr = [],
    onNextPage,
    hasNextPage,
  } = messagesData ?? {};

  // console.log('messagesArr:', messagesArr)

  const [inputMessage, setInputMessage] = useState('');
  // const [loadingImages, setLoadingImages] = useState<string[]>([]);

  const [sortedMessages, setSortedMessages] = useState<IMessage[]>([]);
  console.log('sortedMessages: ', sortedMessages);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [fullImage, setFullImage] = useState<string>('');
  const imageUriRef = useRef(imageUri);
  const [loadingImages, setLoadingImages] = useState<IMessage[]>([]);
  console.log('loadingImages: ', loadingImages);
  const [subChannelData, setSubChannelData] = useState<Amity.SubChannel>();
  const [displayImages, setDisplayImages] = useState<IDisplayImage[]>([]);
  console.log('displayImages:', displayImages)
  // console.log('loadingImages: ', loadingImages);
  const disposers: Amity.Unsubscriber[] = [];
  // console.log('disposers: ', disposers);

  const actions: Action[] = [
    {
      title: 'Take Image',
      type: 'capture',
      options: {
        saveToPhotos: true,
        mediaType: 'photo',
        includeBase64: false,
      },
    },
    {
      title: 'Select Image',
      type: 'library',
      options: {
        selectionLimit: 1,
        mediaType: 'photo',
        includeBase64: false,
      },
    },
  ];
  navigation.setOptions({
    // eslint-disable-next-line react/no-unstable-nested-components
    header: () => (
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.chatTitleWrap}>
            <TouchableOpacity onPress={handleBack}>
              <BackButton onPress={handleBack} />
            </TouchableOpacity>

            {chatReceiver ? (
              <Image
                style={styles.avatar}
                source={
                  chatReceiver?.avatarFileId
                    ? {
                      uri: `https://api.amity.co/api/v3/files/${chatReceiver?.avatarFileId}/download`,
                    }
                    : require('../../../assets/icon/Placeholder.png')
                }
              />
            ) : groupChat?.avatarFileId ? (
              <Image
                style={styles.avatar}
                source={{
                  uri: `https://api.amity.co/api/v3/files/${groupChat?.avatarFileId}/download`,
                }}
              />
            ) : (
              <View style={styles.icon}>
                <Image
                  style={styles.chatIcon}
                  source={require('../../../assets/icon/GroupChat.png')}
                />
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
              navigation.navigate('ChatDetail', { channelId: channelId });
            }}
          >
            <Image
              style={styles.settingIcon}
              source={require('../../../assets/icon/setting.png')}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    ),
    headerTitle: '',
  });

  const subscribeSubChannel = (subChannel: Amity.SubChannel) =>
    disposers.push(subscribeTopic(getSubChannelTopic(subChannel)));


  useEffect(() => {
    if (channelId) {
      SubChannelRepository.getSubChannel(
        channelId,
        ({ data: subChannel }) => {
          console.log("subChannel: ", subChannel);
          setSubChannelData(subChannel);
        }
      );
    }
  }, [channelId]);

  const startRead = async () => {
    const res = await SubChannelRepository.startReading(channelId);
    console.log('res start read:', res)
  };

  useEffect(() => {
    if (subChannelData && channelId) {
      startRead()
      console.log('subChannelData before pass: ', subChannelData);
      const unsubscribe = MessageRepository.getMessages(
        { subChannelId: channelId, limit: 10 },
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
          avatarUrl = `https://api.amity.co/api/v3/files/${(groupChat?.users as any)[targetIndex as number]
            ?.avatarFileId as any
            }/download`;
        } else if (chatReceiver && chatReceiver.avatarFileId) {
          avatarUrl = `https://api.amity.co/api/v3/files/${chatReceiver.avatarFileId}/download`;
        }

        if ((item?.data as Record<string, any>)?.fileId) {
          return {
            _id: item.messageId,
            text: '',
            image:
              `https://api.amity.co/api/v3/files/${(item?.data as Record<string, any>).fileId
              }/download` ?? undefined,
            createdAt: new Date(item.createdAt),
            user: {
              _id: item.creatorId ?? '',
              name: item.creatorId ?? '',
              avatar: avatarUrl,
            },
            messageType: item.dataType,
          };
        } else {
          return {
            _id: item.messageId,
            text:
              ((item?.data as Record<string, string>)?.text as string) ?? '',
            createdAt: new Date(item.createdAt),
            user: {
              _id: item.creatorId ?? '',
              name: item.creatorId ?? '',
              avatar: avatarUrl,
            },
            messageType: item.dataType,
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
    console.log('handleBack: ', handleBack);
    console.log('disposers: ', disposers);
    disposers.forEach((fn) => fn());
  }

  const loadNextMessages = () => {
    if (flatListRef.current && hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  useEffect(() => {
    // console.log('messages: ', messages);
    const sortedMessagesData: IMessage[] = messages.sort((x, y) => {
      return new Date(x.createdAt) < new Date(y.createdAt) ? 1 : -1;
    });
    // console.log('sortedMessagesData: ', sortedMessagesData);
    const reOrderArr = sortedMessagesData;
    setSortedMessages([...reOrderArr]);
  }, [messages]);

  const openFullImage = (image: string) => {
    const fullSizeImage: string = image + '?size=full';
    setFullImage(fullSizeImage);
    setIsVisibleFullImage(true);
  };
  const renderTimeDivider = (date: Date) => {
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
          <Text >
            {displayText}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatMessages = (message: IMessage, index: number) => {
    // console.log('message: ', message);
    const isUserChat: boolean =
      message?.user?._id === (client as Amity.Client).userId;
    let isRenderDivider = false
    const messageDate = moment(message.createdAt)
    console.log('messageDate:', messageDate)
    const previousMessageDate = moment(sortedMessages[index + 1]?.createdAt)
    const isSameDay = messageDate.isSame(previousMessageDate, 'day');
    console.log('isSameDay:', isSameDay)
    console.log('previousMessageDate:', previousMessageDate)
    if (!isSameDay || index === sortedMessages.length-1) {
      isRenderDivider = true
    }
    return (
      <View>
        {isRenderDivider && renderTimeDivider(message.createdAt as Date)}
        <View
          style={!isUserChat ? styles.leftMessageWrap : styles.rightMessageWrap}
        >
          {!isUserChat && (
            <Image
              source={
                message.user.avatar
                  ? { uri: message.user.avatar }
                  : require('../../../assets/icon/Placeholder.png')
              }
              style={styles.avatarImage}
            />
          )}

          <View>
            {!isUserChat && (
              <Text
                style={isUserChat ? styles.chatUserText : styles.chatFriendText}
              >
                {message.user.name}
              </Text>
            )}

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
              <TouchableOpacity
                style={[
                  styles.imageChatBubble,
                  isUserChat ? styles.userImageBubble : styles.friendBubble,
                ]}
                onPress={() => openFullImage(message.image as string)}
              >

                <Image
                  style={styles.imageMessage}
                  source={{
                    uri: message.image + '?size=medium',
                  }}
                />
              </TouchableOpacity>
            )}

            <Text
              style={[
                styles.chatTimestamp,
                {
                  alignSelf: isUserChat ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              {moment(message.createdAt).format('hh:mm A')}
            </Text>


          </View>
        </View>
      </View>
    );
  };
  const handlePress = () => {
    Keyboard.dismiss();
    setIsExpanded(!isExpanded);
    console.log('display Imagess', displayImages)
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
        });

      console.log(result);
      console.log('result: ', result);
      if (
        result.assets &&
        result.assets.length > 0 &&
        result.assets[0] !== null &&
        result.assets[0]
      ) {
        const selectedImages = result.assets;
        const imageUriArr: string[] = selectedImages.map((item) => item.uri);
        const imagesArr = [...imageMultipleUri];
        const totalImages = imagesArr.concat(imageUriArr);
        setImageMultipleUri(totalImages);
        // do something with uri
      }
    }

  };


  const createImageMessage = async (fileId: string) => {
    console.log('createImageMessage: trigger')

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
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string
  ) => {
    const imageObject: IDisplayImage = {
      url: fileUrl,
      fileId: fileId,
      fileName: fileName,
      isUploaded: true,
    };
    console.log('on Finish pass thissss')
    // createImageMessage(fileId, originalPath)
    setDisplayImages((prevData) => {
      const newData: IDisplayImage[] = prevData.filter((item: IDisplayImage) => item.url !== originalPath); // Filter out objects containing the desired value
      return newData; // Update the state with the filtered array
    });
    setImageMultipleUri((prevData) => {
      const newData = prevData.filter((url: string) => url !== originalPath); // Filter out objects containing the desired value
      return newData; // Update the state with the filtered array
    });
    createImageMessage(fileId)
    console.log('fileId:', fileId)
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
      setDisplayImages((prev) => [...prev, ...imagesObject]);
    } else if (imageMultipleUri.length > 0 && displayImages.length > 0) {
      const filteredDuplicate = imageMultipleUri.filter((url: string) => {
        const fileName: string = url.substring(url.lastIndexOf('/') + 1);
        return !displayImages.some((item) => item.fileName === fileName);
      });

      const imagesObject: IDisplayImage[] = filteredDuplicate.map(
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
      setDisplayImages((prev) => [...prev, ...imagesObject]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageMultipleUri]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });


    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImages = result.assets;
      const imageUriArr: string[] = selectedImages.map((item) => item.uri);
      const imagesArr = [...imageMultipleUri];
      const totalImages = imagesArr.concat(imageUriArr);
      setImageMultipleUri(totalImages);
    }
  };
  // const allMessages = [...loadingImages, ...sortedMessages];
  // console.log('allMessages: ', allMessages);


  return (
    <View style={styles.container}>
      {/* {isMessagesLoading && <LoadingIndicator />} */}
      <View style={styles.chatContainer}>
        <FlatList
          data={sortedMessages}
          renderItem={({ item, index }) => renderChatMessages(item, index)}
          keyExtractor={(item) => item._id}
          onEndReached={loadNextMessages}
          onEndReachedThreshold={0.5}
          inverted
          ref={flatListRef}
          // onRefresh={handleRefresh}
          ListHeaderComponent={() =>
            <View style={styles.loadingImage}>
              <FlatList
                keyExtractor={(item: IDisplayImage) => item.fileName}
                data={displayImages}
                renderItem={({ item, index }) => (
                  <LoadingImage
                    source={item.url}
                    // onClose={handleOnCloseImage}
                    index={index}
                    onLoadFinish={handleOnFinishImage}
                    isUploaded={item.isUploaded}
                    fileId={item.fileId}
                  />
                )}
                scrollEnabled={false}
                numColumns={1}
              />
            </View>}
        />

        {/* {displayImages.length > 0 && (
          <FlatList
            data={displayImages}
            renderItem={({ item, index }) => (
              <LoadingImage
                source={item.url}
                // onClose={handleOnCloseImage}
                index={index}
                onLoadFinish={handleOnFinishImage}
                isUploaded={item.isUploaded}
                fileId={item.fileId}
              />
            )}
            scrollEnabled={false}
            numColumns={1}
          />
        )} */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 110, android: 100 })}
        style={styles.AllInputWrap}
      >
        <View style={styles.InputWrap}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={(text) => setInputMessage(text)}
            placeholder="Type a message..."
            placeholderTextColor="#8A8A8A"
            onFocus={handleOnFocus}
          />

          {inputMessage.length > 0 ? (
            <TouchableOpacity onPress={handleSend} style={styles.sendIcon}>
              <Image
                source={require('../../../assets/icon/send.png')}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          ) : (
            <View>

              <TouchableOpacity onPress={handlePress} style={styles.sendIcon}>
                <Image
                  source={require('../../../assets/icon/plus.png')}
                  style={{ width: 20, height: 20 }}
                />
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
                <Image
                  source={require('../../../assets/icon/camera.png')}
                  style={{ width: 32, height: 28 }}
                />
              </View>
              <CustomText>Camera</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              // disabled={loadingImages.length > 0}
              onPress={pickImage}
              style={{ marginHorizontal: 20, alignItems: 'center' }}
            >
              <View style={styles.IconCircle}>
                <Image
                  source={require('../../../assets/icon/gallery.png')}
                  style={{ width: 32, height: 28 }}
                />
              </View>
              <CustomText>Album</CustomText>
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
    </View>
  );
};
export default ChatRoom;
