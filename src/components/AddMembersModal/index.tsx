import { UserRepository } from '@amityco/ts-sdk';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  NativeSyntheticEvent,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { styles } from './styles';
import { circleCloseIcon, closeIcon, searchIcon } from '../../svg/svg-xml-list';
import type { UserInterface } from '../../types/user.interface';
import UserItem from '../UserItem';
import SectionHeader from '../ListSectionHeader';
import SelectedUserHorizontal from '../SelectedUserHorizontal';
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
const AddMembersModal = ({ visible, onClose, onFinish, initUserList = [] }: IModal) => {

  // console.log('sectionedUserList:', sectionedUserList)
  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>(initUserList);
  const [sectionedGroupUserList, setSectionedGroupUserList] = useState<SelectUserList[]>([]);
  // console.log('sectionedGroupUserList:', sectionedGroupUserList)
  // console.log('sectionedGroupUserList:', sectionedGroupUserList)
  // console.log('sectionedUserList:', sectionedUserList)
  const [selectedUserList, setSelectedUserList] = useState<UserInterface[]>(initUserList);
  // console.log('selectedUserList:', selectedUserList)
  // const [isScrollEnd, setIsScrollEnd] = useState(false);
  const [usersObject, setUsersObject] = useState<Amity.LiveCollection<Amity.User>>();
  const [searchTerm, setSearchTerm] = useState('');
const [isShowSectionHeader, setIsShowSectionHeader] = useState<boolean>(false)
  const { data: userArr = [], onNextPage } = usersObject ?? {};
  // console.log('userArr:', userArr)



  //   useEffect(() => {
  //  setSelectedUserList(initUserList)
  //   }, [initUserList])

  const queryAccounts = (text: string = '') => {

    UserRepository.getUsers(
      { displayName: text, limit: 20 },
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

    const sectionUserArr = userArr.map((item) => {
      const firstChar = (item.displayName as string).charAt(0).toUpperCase();
      const isAlphabet = /^[A-Z]$/i.test(firstChar);
      const currentLetter = isAlphabet ? (item.displayName as string).charAt(0).toUpperCase() : '#'
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

  }, [visible, searchTerm])

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

  const renderSectionHeader = () => (
    <SectionHeader title={''} />
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


  const renderItem = ({ item, index }: ListRenderItemInfo<UserInterface>) => {
    let isrenderheader = true;
    const isAlphabet = /^[A-Z]$/i.test(item.displayName[0] as string);
    const currentLetter = isAlphabet ? (item.displayName as string).charAt(0).toUpperCase() : '#'
    const selectedUser = selectedUserList.some(
      (user) => user.userId === item.userId
    );
    const userObj: UserInterface = { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }

    if (index > 0 && sectionedUserList.length > 0) {

      const isPreviousletterAlphabet = /^[A-Z]$/i.test(((sectionedUserList[index - 1]) as any).displayName[0]);
      const previousLetter = isPreviousletterAlphabet ? ((sectionedUserList[index - 1]) as any).displayName.charAt(0).toUpperCase() : '#'
      if (currentLetter === previousLetter) {
        isrenderheader = false
      } else {
        isrenderheader = true
      }

    }



    return (
      <View>
        {isrenderheader && <SectionHeader title={currentLetter} />}

        <UserItem showThreeDot={false} user={userObj} isCheckmark={selectedUser} onPress={onUserPressed} />
      </View>

    );
  };



  const flatListRef = useRef(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset >= 40) {
      setIsShowSectionHeader(true)
      // The FlatList is approximately 200 pixels away from the top
      console.log('Scrolled 200 pixels from top');
    }else{
      setIsShowSectionHeader(false)
    }
  };
  const handleOnClose = () => {
    setSelectedUserList(initUserList)
    onClose && onClose();

  }
  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage()
    }
  }

  const onDeleteUserPressed = (user: UserInterface) => {
    const removedUser = selectedUserList.filter(item => item !== user)
    setSelectedUserList(removedUser)
  }


  const onDone = () => {
    onFinish && onFinish(selectedUserList)
    setSelectedUserList([])
    onClose && onClose()
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleOnClose}>
            <SvgXml xml={closeIcon} width="14" height="14" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Select Member</Text>
          </View>
          <TouchableOpacity disabled={selectedUserList.length === 0} onPress={onDone}>
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
          data={sectionedUserList}
          renderItem={renderItem}
          // renderSectionHeader={renderSectionHeader}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          keyExtractor={(item) => item.userId}
          ListHeaderComponent={isShowSectionHeader?renderSectionHeader:<View/>}
          stickyHeaderIndices={[0]}
          ref={flatListRef}
          onScroll={handleScroll}
        />
      </View>
    </Modal>
  );
};

export default AddMembersModal;

