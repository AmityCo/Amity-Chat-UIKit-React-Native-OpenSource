import { UserRepository } from '@amityco/ts-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  SectionList,
  NativeScrollEvent,
  ListRenderItemInfo,
  TextInput,
  FlatList,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { styles } from './styles';
import { circleCloseIcon, closeIcon, searchIcon } from '../../svg/svg-xml-list';
import type { UserInterface } from '../../types/user.interface';

import SectionHeader from '../../components/ListSectionHeader';
import SelectedUserHorizontal from '../../components/SelectedUserHorizontal';
import UserItem from '../../components/UserItem';
interface IModal {
  visible: boolean;
  userId?: string;
  initUserList?: UserInterface[];
  onClose?: () => void;
  onFinish?: (users: UserInterface[]) => void;
}
export type SelectUserList = {
  title: string;
  data: UserInterface[];
};

export default function SelectMembers({ navigation }: any) {
  const [sectionedGroupUserList, setSectionedGroupUserList] = useState<SelectUserList[]>([]);
  // console.log('sectionedGroupUserList:', sectionedGroupUserList)
  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>([]);
  console.log('sectionedUserList:', sectionedUserList)
  const [selectedUserList, setSelectedUserList] = useState<UserInterface[]>([]);
  // console.log('selectedUserList:', selectedUserList)
  // const [isScrollEnd, setIsScrollEnd] = useState(false);
  const [usersObject, setUsersObject] = useState<Amity.LiveCollection<Amity.User>>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userArr = [], onNextPage } = usersObject ?? {};
  // console.log('userArr:', userArr)



  //   useEffect(() => {
  //  setSelectedUserList(initUserList)
  //   }, [initUserList])

  const queryAccounts = (text: string = '') => {

    UserRepository.getUsers(
      { displayName: text, limit: 5 },
      (data) => {
        setSectionedGroupUserList([])
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
    setSectionedGroupUserList([])
  };

  const createSectionGroup = () => {
    // let userListForSection: SelectUserList[] = [...sectionedUserList]
    // console.log('userListForSection:', userListForSection)

    const sectionUserArr =userArr.map((item) => {
    return { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }
    })
    setSectionedUserList(sectionUserArr)
    // const groupedData: SelectUserList[] = [];

    // sectionUserArr.forEach((item) => {
    //   const existingItemIndex = groupedData.findIndex((groupedItem) => groupedItem.title === item.title);

    //   if (existingItemIndex !== -1 && groupedData) {
    //     // If the title already exists in the groupedData array, merge the data arrays
    //     (groupedData[existingItemIndex] as Record<string, any>).data.push(...item.data);
    //   } else {
    //     // If the title does not exist, add the entire item to the groupedData array
    //     groupedData.push(item);
    //   }
    // });
    // setSectionedGroupUserList(groupedData)
  }

  useEffect(() => {
    createSectionGroup()
  }, [userArr])

  useEffect(() => {
    if (searchTerm.length === 0) {
      queryAccounts()
    }

  }, [searchTerm])

  // useEffect(() => {
  //   const jsonData: SelectUserList[] = [
  //     ...sectionedUserList
  //   ];

  //   const groupedData: SelectUserList[] = [];

  //   jsonData.forEach((item) => {
  //     const existingItemIndex = groupedData.findIndex((groupedItem) => groupedItem.title === item.title);

  //     if (existingItemIndex !== -1 && groupedData) {
  //       // If the title already exists in the groupedData array, merge the data arrays
  //       (groupedData[existingItemIndex] as Record<string, any>).data.push(...item.data);
  //     } else {
  //       // If the title does not exist, add the entire item to the groupedData array
  //       groupedData.push(item);
  //     }
  //   });
  //   setSectionedGroupUserList(groupedData)

  // }, [sectionedUserList])

  const renderSectionHeader = ({ section }: { section: SelectUserList }) => (
    <SectionHeader title={section.title} />
  );

  const onUserPressed = (user: UserInterface) => {
    console.log('user:', user)
    const isIncluded = selectedUserList.some(item => item.userId === user.userId)
    console.log('isIncluded:', isIncluded)
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


  // const handleScroll = ({
  //   nativeEvent,
  // }: {
  //   nativeEvent: NativeScrollEvent;
  // }) => {
  //   const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
  //   const isEnd =
  //     layoutMeasurement.height + contentOffset.y >= contentSize.height;
  //   console.log('isEnd:', isEnd)
  //   // setIsScrollEnd(isEnd);
  // };
  const memoizedSectionedGroupUserList = useMemo(() => {
    const groupedData: SelectUserList[] = [...sectionedGroupUserList];

    // ... your existing logic to create the groupedData ...

    return groupedData;
  }, [sectionedGroupUserList]);

  // const handleOnClose = () => {
  //   setSelectedUserList(initUserList)
  //   onClose && onClose();

  // }
  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage()
    }
  }

  const onDeleteUserPressed = (user: UserInterface) => {
    const removedUser = selectedUserList.filter(item => item !== user)
    setSelectedUserList(removedUser)
  }


  // const onDone = () => {
  //   onFinish && onFinish(selectedUserList)
  //   setSelectedUserList([])
  //   onClose && onClose()
  // }

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
        // renderSectionHeader={renderSectionHeader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.userId}

      />
    </View>

  );
}
