import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ListRenderItemInfo,
  TextInput,
  FlatList,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { styles } from './styles';
import { backIcon, circleCloseIcon, searchIcon } from '../../svg/svg-xml-list';
import type { UserInterface } from '../../types/user.interface';
import UserItem from '../../components/UserItem';

import CustomTab from '../../components/CustomTab';

export type SelectUserList = {
  title: string;
  data: UserInterface[];
};

export default function MemberDetail({ route, navigation }: any) {
  const { channelID } = route.params;
  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>([]);

  const [usersObject, setUsersObject] = useState<Amity.LiveCollection<Amity.Membership<"channel">>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState<number>(1)
  const { data: userArr = [], onNextPage } = usersObject ?? {};



  const queryAccounts = (text: string = '', roles?: string[]) => {

    ChannelRepository.Membership.getMembers(
      { channelId: channelID , limit: 15, search: text, roles: roles ?? [] },
      (data) => {
      	console.log('data:', data)
        setUsersObject(data)

      }
    );


  };
  const handleChange = (text: string) => {
    setSearchTerm(text);
  };
  useEffect(() => {
    if (searchTerm.length > 0 && tabIndex ===1) {
      queryAccounts(searchTerm);
    }
    else if(searchTerm.length > 0 && tabIndex ===2){
      queryAccounts(searchTerm,['channel-moderator'] );
    }
  }, [searchTerm]);

  const clearButton = () => {
    setSearchTerm('');
  };

  const createUserList = () => {
    const sectionUserArr = userArr.map((item) => {
      return { userId: item.userId, displayName: item.user?.displayName as string, avatarFileId: item.user?.avatarFileId as string }
    })
    setSectionedUserList(sectionUserArr)
 
  }

  useEffect(() => {
    createUserList()
  }, [userArr])

  useEffect(() => {
    if (searchTerm.length === 0 && tabIndex ===1) {
      queryAccounts()
    }else if(searchTerm.length === 0 && tabIndex ===2){
        queryAccounts('', ['channel-moderator'])
      }

  }, [searchTerm,tabIndex])



  const onUserPressed = (user: UserInterface) => {
    console.log('user:', user)

  };


  const renderItem = ({ item }: ListRenderItemInfo<UserInterface>) => {

    const userObj: UserInterface = { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }
    return (
      <UserItem showThreeDot={true} user={userObj}  onThreeDotTap={onUserPressed} />
    );
  };


  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage()
    }
  }


  const handleGoBack = () => {
    navigation.goBack()
  }

  const handleTabChange = (index: number) => {
    setTabIndex(index)

  }
  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
          <SvgXml xml={backIcon} width="16" height="16" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Member Detail</Text>
        </View>
      </View>
      <CustomTab tabName={['Members', 'Moderators']} onTabChange={handleTabChange} />
      <View style={styles.inputWrap}>
        <TouchableOpacity onPress={() => queryAccounts(searchTerm)}>
          <SvgXml xml={searchIcon} width="20" height="20" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={handleChange}
        />
        <TouchableOpacity onPress={clearButton}>
          <SvgXml xml={circleCloseIcon} width="20" height="20" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sectionedUserList}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.userId}

      />
    </View>

  );
}
