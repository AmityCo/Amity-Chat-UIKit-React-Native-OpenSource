import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Text,
  type TextStyle,
  TouchableOpacity,
} from 'react-native';
import React, {
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useStyles } from './styles';
import { ChannelRepository, createReport } from '@amityco/ts-sdk-react-native';
import useAuth from './../../hooks/useAuth';

interface IMemberActionModal {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  userId: string;
  channelId: string;
  hasModeratorPermission?: boolean;
  isInModeratorTab?: boolean;
  isChannelModerator?: boolean;
  onFinish?:()=> void;
}

const MemberActionModal: FC<IMemberActionModal> = ({
  isVisible,
  setIsVisible,
  userId,
  channelId,
  hasModeratorPermission,
  isInModeratorTab,
  isChannelModerator,
  onFinish
}) => {
  const styles = useStyles();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const { client } = useAuth() as { client: { userId: string } };
  const currentUserId = client.userId ?? '';

  async function addRole() {
    const didAdd = await ChannelRepository.Moderation.addRole(channelId, 'channel-moderator', [
      userId
    ]);
    if (didAdd) {
      Alert.alert('Promote to moderator ✅')
    }
  }

  async function removeRole() {
    const didRemove = await ChannelRepository.Moderation.removeRole(channelId, 'channel-moderator', [
      userId
    ]);

    if (didRemove) {
      Alert.alert('Remove user from moderator')
    }
  }
  const actionData = useMemo(
    () => [
      {
        id: 'demote',
        label: 'Dismiss to member',
        shouldShow:
          hasModeratorPermission &&
          currentUserId !== userId &&
          isInModeratorTab,
        callBack: async () => {
          removeRole()
          onFinish && onFinish()
        }

      },
      {
        id: 'promote',
        label: 'Promote to moderator',
        shouldShow:
          hasModeratorPermission &&
          currentUserId !== userId &&
          !isInModeratorTab && !isChannelModerator,
        callBack: async () => {
          addRole();
          onFinish && onFinish();

        }
      },
      {
        id: 'report',
        label: 'Report User',
        shouldShow: currentUserId !== userId,
        callBack: async () => {
          const isReport = await createReport('user', userId)
          if (isReport) {
            Alert.alert('Report sent ✅')
            onFinish && onFinish();
          }
        }
      },

    ],
    [
      channelId,
      currentUserId,
      hasModeratorPermission,
      isInModeratorTab,
      userId,
    ]
  );

  const closeModal = useCallback(() => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  }, [setIsVisible, slideAnimation]);

  const onPressAction = useCallback(
    async ({ callBack }) => {
      try {
        await callBack();
      } catch (error) { }
      closeModal();
    },
    [closeModal]
  );

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnimation]);

  const modalStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <Pressable onPress={closeModal} style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, modalStyle]}>
          {actionData.map((data) => {
            const warningStyle: TextStyle | null =
              data.id === 'remove' ? { color: 'red' } : null;
            if (data.shouldShow) {
              return (
                <TouchableOpacity
                  key={data.id}
                  onPress={() => onPressAction(data)}
                  style={styles.modalRow}
                >
                  <Text style={[styles.actionText, warningStyle]}>
                    {data.label}
                  </Text>
                </TouchableOpacity>
              );
            } else return null;
          })}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default memo(MemberActionModal);
