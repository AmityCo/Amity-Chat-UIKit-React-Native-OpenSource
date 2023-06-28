import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { UserRepository, createReport } from '@amityco/ts-sdk';
import CloseButton from '../../../components/BackButton';
import { styles } from './styles';
import { follow } from '@amityco/ts-sdk/dist/userRepository/relationship';
import { LoadingOverlay } from '../../../components/LoadingOverlay/index';

export default function UserProfileSetting({ navigation, route }: any) {
  const { userId, follow } = route.params;
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [followStatus, setFollowStatus] = useState(follow);
  React.useLayoutEffect(() => {
    // Set the headerRight component to a TouchableOpacity
    navigation.setOptions({
      headerLeft: () => <CloseButton navigation={navigation} />,
      title: 'Settings',
    });
  }, [navigation]);

  const handleReportUserPress = async () => {
    setShowLoadingIndicator(true);
    const didCreateUserReport = await createReport('user', userId);
    setShowLoadingIndicator(false);
    return didCreateUserReport;
  };
  const handleUnfollowPress = async () => {
    setShowLoadingIndicator(true);
    const hasUnfollowed = await UserRepository.Relationship.unfollow(userId);
    if (hasUnfollowed) {
      setShowLoadingIndicator(false);
      setFollowStatus('none');
    }
    return hasUnfollowed;
  };

  const renderItem = ({ item }: any) => {
    switch (item.id) {
      // case 1:
      //   return (
      //     <TouchableOpacity
      //       style={styles.rowContainer}
      //       onPress={handleGroupProfilePress}
      //     >
      //       <View style={styles.iconContainer}>
      //         <Image
      //           source={require('../../../../assets/icon/editPencil.png')}
      //           style={styles.icon}
      //         />
      //       </View>
      //       <Text style={styles.rowText}>Group profile</Text>
      //       <Image
      //         source={require('../../../../assets/icon/arrowRight.png')}
      //         style={styles.arrowIcon}
      //       />
      //     </TouchableOpacity>
      //   );
      case 1:
        console.log('checking follow status ' + followStatus);
        return followStatus === 'accepted' ? (
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={handleUnfollowPress}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../../assets/icon/unfollow.png')}
                style={styles.unfollowIcon}
              />
            </View>
            <Text style={styles.rowText}>Unfollow</Text>
            {/* <Image
              source={require('../../../../assets/icon/arrowRight.png')}
              style={styles.arrowIcon}
            /> */}
          </TouchableOpacity>
        ) : (
          <View />
        );
      case 2:
        return (
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={handleReportUserPress}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../../assets/icon/report.png')}
                style={styles.groupIcon}
              />
            </View>
            <Text style={styles.rowText}>Report user</Text>
            {/* <Image
              source={require('../../../../assets/icon/arrowRight.png')}
              style={styles.arrowIcon}
            /> */}
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const data = [{ id: 1 }, { id: 2 }];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {/* <View style={styles.loadingIndicator}> */}
      {/* {showLoadingIndicator ? (
        <LoadingOverlay
          isLoading={showLoadingIndicator}
          loadingText="Loading..."
        />
      ) : (
        <View />
      )} */}

      {/* </View> */}
    </View>
  );
}
