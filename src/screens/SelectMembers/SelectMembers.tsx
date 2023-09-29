import { UserRepository } from '@amityco/ts-sdk-react-native';
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
import { circleCloseIcon, closeIcon, searchIcon } from '../../svg/svg-xml-list';
import type { UserInterface } from '../../types/user.interface';

import SelectedUserHorizontal from '../../components/SelectedUserHorizontal';
import UserItem from '../../components/UserItem';

export type SelectUserList = {
  title: string;
  data: UserInterface[];
};

export default function SelectMembers() {

  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>([]);
  const [selectedUserList, setSelectedUserList] = useState<UserInterface[]>([]);
  const [usersObject, setUsersObject] = useState<Amity.LiveCollection<Amity.User>>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userArr = [], onNextPage } = usersObject ?? {};


  const queryAccounts = (text: string = '') => {

    UserRepository.getUsers(
      { displayName: text, limit: 15 },
      (data) => {
        setUsersObject(data)

      }
    );


  };
  const handleChange = (text: string) => {
    setSearchTerm(text);
  };
  useEffect(() => {
    if (searchTerm.length > 2) {
      queryAccounts(searchTerm);
    }
  }, [searchTerm]);

  const clearButton = () => {
    setSearchTerm('');
  };

  const createSectionGroup = () => {

    const sectionUserArr =userArr.map((item) => {
    return { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }
    })
    setSectionedUserList(sectionUserArr)
  }

  useEffect(() => {
    createSectionGroup()
  }, [userArr])

  useEffect(() => {
    if (searchTerm.length === 0) {
      queryAccounts()
    }

  }, [searchTerm])


  const onUserPressed = (user: UserInterface) => {
    const isIncluded = selectedUserList.some(item => item.userId === user.userId)
    if (isIncluded) {
      const removedUser = selectedUserList.filter(item => item.userId !== user.userId)
      setSelectedUserList(removedUser)
    } else {
      setSelectedUserList(prev => [...prev, user])
    }

  };


  const renderItem = ({ item }: ListRenderItemInfo<UserInterface>) => {

    const selectedUser = selectedUserList.some(
      (user) => user.userId === item.userId
    );
    const userObj: UserInterface = { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }
    return (
      <UserItem showThreeDot={false} user={userObj} isCheckmark={selectedUser} onPress={onUserPressed} />
    );
  };



  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage()
    }
  }

  const onDeleteUserPressed = (user: UserInterface) => {
    const removedUser = selectedUserList.filter(item => item !== user)
    setSelectedUserList(removedUser)
  }


  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <SvgXml xml={closeIcon} width="14" height="14" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Select Member</Text>
        </View>
        <TouchableOpacity disabled={selectedUserList.length === 0} >
          <Text style={[selectedUserList.length > 0 ? styles.doneText : styles.disabledDone]}>Done</Text>
        </TouchableOpacity>
      </View>
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
      {selectedUserList.length > 0 ? (
        <SelectedUserHorizontal
          users={selectedUserList}
          onDeleteUserPressed={onDeleteUserPressed}
        />
      ) : (
        <View />
      )}
      <FlatList
        data={ sectionedUserList}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.userId}

      />
    </View>

  );
}
