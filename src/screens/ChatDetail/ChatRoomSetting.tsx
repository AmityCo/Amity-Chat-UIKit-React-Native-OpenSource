import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { leaveAmityChannel } from '../../providers/channel-provider';
import { styles } from './styles';
import { createReport } from '@amityco/ts-sdk-react-native';

interface ChatDetailProps {
    navigation: any;
    route: any;
}

export const ChatRoomSetting: React.FC<ChatDetailProps> = ({ navigation, route }) => {
    const { channelId, channelType, chatReceiver, groupChat } = route.params;
    console.log('chatReceiver:', chatReceiver)
    console.log('channelId:', channelId)
    console.log('channelType:', channelType)
    const handleGroupProfilePress = () => {
        navigation.navigate('EditChatDetail', { navigation, channelId: channelId, groupChat: groupChat });
    };

    const handleMembersPress = () => {
        navigation.navigate('MemberDetail', { navigation, channelID: channelId });
    };

    const handleLeaveChatPress = async () => {
        Alert.alert(
            'Leave chat',
            `If leave this group, you’ll no longer be able to see any messages and files.`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Leave',
                style: 'destructive',
                onPress: () => onLeaveChat(),
              },
            ]
          );
    
    };

    const onLeaveChat =async ()=>{
        const isLeave = await leaveAmityChannel(channelId)
        console.log('isLeave:', isLeave)
        if(isLeave){
            navigation.navigate('RecentChat')
        }

    }
    const renderItem = ({ item }: any) => {
        switch (item.id) {
            case 1:
                return (
                    <TouchableOpacity style={styles.rowContainer} onPress={handleGroupProfilePress}>
                        <View style={styles.iconContainer}>
                            <Image source={require('../../../assets/icon/editPencil.png')} style={styles.icon} />
                        </View>
                        <Text style={styles.rowText}>Group profile</Text>
                        <Image source={require('../../../assets/icon/arrowRight.png')} style={styles.arrowIcon} />
                    </TouchableOpacity>
                );
            case 2:
                return (
                    <TouchableOpacity style={styles.rowContainer} onPress={handleMembersPress}>
                        <View style={styles.iconContainer}>
                            <Image source={require('../../../assets/icon/groupMember.png')} style={styles.groupIcon} />
                        </View>
                        <Text style={styles.rowText}>Members</Text>
                        <Image source={require('../../../assets/icon/arrowRight.png')} style={styles.arrowIcon} />
                    </TouchableOpacity>
                );
            case 3:
                return (
                    <TouchableOpacity style={styles.rowContainer} onPress={handleLeaveChatPress}>
                        <View style={styles.ChatSettingContainer}>
                            <Text style={styles.leaveChatLabel}>Leave Chat</Text>
                        </View>
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };
    async function flagUser() {
        if(chatReceiver){
            const didCreateUserReport = await createReport('user', chatReceiver.userId);
            if(didCreateUserReport){
                Alert.alert('Report sent', '', []);
            }
       
        }
  
      }
    const data = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
    ];

    return (
        <View style={styles.container}>
            {channelType == 'conversation' ?
                <TouchableOpacity style={styles.rowContainer} onPress={flagUser}>
                    <View style={styles.ChatSettingContainer}>
                        <Text style={styles.reportChatLabel}>Report User</Text>
                    </View>
                </TouchableOpacity> :
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            }

        </View>
    );
};