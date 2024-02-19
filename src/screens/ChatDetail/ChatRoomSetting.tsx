import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { leaveAmityChannel } from '../../providers/channel-provider';
import { useStyles } from './styles';
import { createReport } from '@amityco/ts-sdk-react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import EditIcon from '../../svg/EditIcon';
import { ArrowRightIcon } from '../../svg/ArrowRightIcon';
import { GroupMembersIcon } from '../../svg/GroupMembersIcon';
import { BackIcon } from '../../svg/BackIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';

interface ChatDetailProps {
    navigation: any;
    route: any;
}

export const ChatRoomSetting: React.FC<ChatDetailProps> = ({ navigation, route }) => {
    const theme = useTheme() as MyMD3Theme;
    const styles = useStyles();
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
    const handleGoBack = () => {
        navigation.goBack()
    }

    const renderItem = ({ item }: any) => {
        switch (item.id) {
            case 1:
                return (
                    <TouchableOpacity style={styles.rowContainer} onPress={handleGroupProfilePress}>
                        <View style={styles.iconContainer}>
                            <EditIcon />
                        </View>
                        <Text style={styles.rowText}>Group profile</Text>
                        <ArrowRightIcon />
                    </TouchableOpacity>
                );
            case 2:
                return (
                    <TouchableOpacity style={styles.rowContainer} onPress={handleMembersPress}>
                        <View style={styles.iconContainer}>
                            <GroupMembersIcon />
                        </View>
                        <Text style={styles.rowText}>Members</Text>
                        <ArrowRightIcon color={theme.colors.base} />
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
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
                    <BackIcon color={theme.colors.base} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>Chat Detail</Text>
                </View>
            </View>
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