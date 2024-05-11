import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  type ListRenderItemInfo,
  TextInput,
  FlatList,
} from 'react-native';

import { useStyles } from './styles';
import type { UserInterface } from '../../types/user.interface';
import UserItem from '../../components/UserItem';

import CustomTab from '../../components/CustomTab';
import { SearchIcon } from '../../svg/SearchIcon';
import { CircleCloseIcon } from '../../svg/CircleCloseIcon';
import { BackIcon } from '../../svg/BackIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import MemberActionModal from '../../components/MemberActionModal/MemberActionModal';
import useAuth from '../../hooks/useAuth';
import { useChannelPermission } from '../../hooks/useChannelPermission';

export type SelectUserList = {
  title: string;
  data: UserInterface[];
};

export default function MemberDetail({ route, navigation }: any) {

  const styles = useStyles();
  const { client } = useAuth()
  const { channelID } = route.params;
  const permission = useChannelPermission(channelID)
  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>([]);

  const [usersObject, setUsersObject] = useState<Amity.LiveCollection<Amity.Membership<"channel">>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState<number>(1)
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface>()
  const [isSelectedUserModerator, setIsSelectedUserModerator] = useState<boolean>(false)
  let { data: userArr = [], onNextPage } = usersObject ?? {};


  const theme = useTheme() as MyMD3Theme;

  const queryAccounts = (text: string = '', roles?: string[]) => {

    ChannelRepository.Membership.getMembers(
      { channelId: channelID, limit: 15, search: text, roles: roles ?? [] },
      (data) => {
        setUsersObject(data)

      }
    );


  };
  const handleChange = (text: string) => {
    setSearchTerm(text);
  };
  useEffect(() => {
    if (searchTerm.length > 0 && tabIndex === 1) {
      queryAccounts(searchTerm);
    }
    else if (searchTerm.length > 0 && tabIndex === 2) {
      queryAccounts(searchTerm, ['channel-moderator']);
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
    if (searchTerm.length === 0 && tabIndex === 1) {
      queryAccounts()
    } else if (searchTerm.length === 0 && tabIndex === 2) {
      queryAccounts('', ['channel-moderator'])
    }

  }, [tabIndex, searchTerm])



  const onUserPressed = (user: UserInterface) => {
    setSelectedUser(user);
    setActionModalVisible(true)
    const index = userArr.findIndex(item => item.userId === user.userId);
    if (userArr[index]?.roles.includes('channel-moderator')) {
      setIsSelectedUserModerator(true)
    } else {
      setIsSelectedUserModerator(false)
    }


  };

  const renderItem = ({ item }: ListRenderItemInfo<UserInterface>) => {

    const userObj: UserInterface = { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string }
    return (
      <UserItem showThreeDot={true} isUserAccount={(client as Amity.Client).userId === userObj.userId ? true : false} user={userObj} onThreeDotTap={onUserPressed} />
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
          <BackIcon color={theme.colors.base} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Member Detail</Text>
        </View>
      </View>
      <CustomTab tabName={['Members', 'Moderators']} onTabChange={handleTabChange} />
      <View style={styles.inputWrap}>
        <TouchableOpacity onPress={() => queryAccounts(searchTerm)}>
          <SearchIcon color={theme.colors.base} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={handleChange}
        />
        <TouchableOpacity onPress={clearButton}>
          <CircleCloseIcon color={theme.colors.base} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sectionedUserList}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.userId}

      />
      <MemberActionModal
        isVisible={actionModalVisible}
        setIsVisible={setActionModalVisible}
        userId={selectedUser?.userId as string}
        channelId={channelID}
        hasModeratorPermission={permission}
        isInModeratorTab={tabIndex === 2}
        isChannelModerator={isSelectedUserModerator}
      />
    </View>

  );
}
