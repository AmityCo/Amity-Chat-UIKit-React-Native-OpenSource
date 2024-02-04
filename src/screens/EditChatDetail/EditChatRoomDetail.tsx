/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  TextInput,
} from 'react-native';

import { styles } from './styles';
import CloseButton from '../../components/CloseButton/index';
import DoneButton from '../../components/DoneButton';
import { updateAmityChannel } from '../../providers/channel-provider';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';
import LoadingImage from '../../components/LoadingImage';
import type { RootStackParamList } from '../../routes/RouteParamList';
import { RouteProp, useRoute } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraIcon } from '../../svg/CameraIcon';

interface EditChatDetailProps {
  navigation: any;
  route: any;
}



export const EditChatRoomDetail: React.FC<EditChatDetailProps> = ({
  navigation,
}) => {

  const { apiRegion } = useAuth()
  const route = useRoute<RouteProp<RootStackParamList, 'EditChatDetail'>>();
  const MAX_CHARACTER_COUNT = 100;
  const { channelId, groupChat } = route.params;

  const [displayName, setDisplayName] = useState<string | undefined>(groupChat?.displayName);
  const [characterCount, setCharacterCount] = useState(0);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const [uploadedFileId, setUploadedFileId] = useState<string>()



  useEffect(() => {
    navigation.setOptions({

      header: () => (
        <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <CloseButton navigation={navigation} />
          <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Member Detail</Text>
        </View>
          <DoneButton navigation={navigation} onDonePressed={onDonePressed} />
        </View>
        </SafeAreaView>
      ),
      headerTitle: '',
    });


  }, [])
  const onDonePressed = async () => {

    try {

      setShowLoadingIndicator(true);
      const result = await updateAmityChannel(
        channelId,
        uploadedFileId as string,
        displayName
      );
      if (result) {

        setShowLoadingIndicator(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pickCamera = async () => {
    // No permissions request is necessary for launching the image library
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    setImageMultipleUri([])
    if (permission.granted) {
      let result: ImagePicker.ImagePickerResult =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
        });

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

  const pickImage = async () => {
    setImageMultipleUri([])
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

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickCamera();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      // Alert.alert('Select a Photo', '', [
      //   { text: 'Cancel', style: 'cancel' },
      //   { text: 'Take Photo', onPress: pickCamera },
      //   { text: 'Choose from Library', onPress: pickImage },
      // ]);
      pickImage()
   
    }
  };

  const handleTextChange = (text: string) => {
    setDisplayName(text);
    setCharacterCount(text.length);
  };
  const handleOnFinishImage = async (
    fileId: string,
  ) => {
    setUploadedFileId(fileId)


  }
  return (
    <View style={styles.container}>

      <LoadingOverlay
        isLoading={showLoadingIndicator}
        loadingText="Loading..."
      />
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarPress}>
          {imageMultipleUri.length > 0 ?

            <View>
              <LoadingImage
                containerStyle={styles.uploadedImage}
                isShowSending={false}
                source={imageMultipleUri[0] as string}
                onLoadFinish={handleOnFinishImage}
              />
            </View>


            : <Image
              style={styles.avatar}
              source={
                groupChat?.avatarFileId
                  ? { uri: `https://api.${apiRegion}.amity.co/api/v3/files/${groupChat?.avatarFileId}/download` }
                  : require('../../../assets/icon/Placeholder.png')
              }
            />}

          {/* <Image
            style={styles.avatar}
            source={
              imageMultipleUri.length>0
                ? { uri: imageMultipleUri[0] }
                : require('../../../assets/icon/Placeholder.png')
            }
          /> */}
        </TouchableOpacity>
        <View style={imageMultipleUri[0] ? styles.uploadedCameraIconContainer : styles.cameraIconContainer}>
          <TouchableOpacity onPress={handleAvatarPress}>
            <View style={styles.cameraIcon}>
             <CameraIcon width={16} height={16}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.displayNameContainer}>
        <Text style={styles.displayNameText}>Group name</Text>
        <View style={styles.characterCountContainer}>
          <Text
            style={styles.characterCountText}
          >{`${characterCount}/${MAX_CHARACTER_COUNT}`}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={handleTextChange}
        maxLength={MAX_CHARACTER_COUNT}
        placeholder="Enter your display name"
        placeholderTextColor="#a0a0a0"
      />
       
    </View>
  );
};
