import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { leaveAmityChannel } from '../../providers/channel-provider';
import { styles } from './styles';
import { createReport } from '@amityco/ts-sdk-react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

interface ChatDetailProps {
    navigation: any;
    route: any;
}

export const ChatRoomSetting: React.FC<ChatDetailProps> = ({ navigation, route }) => {
    const { channelId, channelType, chatReceiver, groupChat } = route.params;
    const [showReportAlert, setShowReportAlert] = useState<boolean>(false);
    const [showLeaveAlert, setShowLeaveAlert] = useState<boolean>(false);
    const handleGroupProfilePress = () => {
        navigation.navigate('EditChatDetail', { navigation, channelId: channelId, groupChat: groupChat });
    };

    const handleMembersPress = () => {
        navigation.navigate('MemberDetail', { navigation, channelID: channelId });
    };

    const handleLeaveChatPress = async () => {
        setShowLeaveAlert(true)
    };

    const onLeaveChat = async () => {

        const isLeave = await leaveAmityChannel(channelId)
        setShowLeaveAlert(false);
        if (isLeave) {
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
        if (chatReceiver) {
            const didCreateUserReport = await createReport('user', chatReceiver.userId);
            if (didCreateUserReport) {
                setShowReportAlert(true)
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
            <AwesomeAlert
                show={showReportAlert}
                showProgress={false}
                title="Report sent"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="OK"
                confirmButtonColor="#1054DE"
                onCancelPressed={() => {
                    setShowReportAlert(false);
                }}
                onConfirmPressed={() => setShowReportAlert(false)}
                onDismiss={() => setShowReportAlert(false)}
            />
            <AwesomeAlert
                show={showLeaveAlert}
                showProgress={false}
                title="Leave Chat"
                message='If leave this group, you’ll no longer be able to see any messages and files.'
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                confirmText="Leave"
                cancelText="Cancel"
                confirmButtonColor="#FA4D30"
                cancelButtonColor="#1054DE"
                onCancelPressed={() => {
                    setShowLeaveAlert(false);
                }}
                onConfirmPressed={() => onLeaveChat()}
                onDismiss={() => setShowLeaveAlert(false)}
            />
        </View>
    );
};