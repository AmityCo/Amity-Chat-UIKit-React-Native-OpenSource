import React, { useRef, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

const maxLength = 10;
const displayName = (user: Amity.User) => {
  if (user.displayName) {
    if (user.displayName!.length > maxLength) {
      return user.displayName!.substring(0, maxLength) + '..';
    }
    return user.displayName!;
  }
  return 'Display name';
};
const AvatarListItem = ({
  user,
  onDelete,
}: {
  user: Amity.User;
  onDelete: () => void;
}) => {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatar}>
        <View style={styles.avatarImageContainer}>
          <Image
            style={styles.avatarImage}
            source={
              user.avatarCustomUrl
                ? { uri: user.avatarCustomUrl }
                : require('../../../assets/icon/Placeholder.png')
            }
          />
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.userName}>{displayName(user)}</Text>
    </View>
  );
};

export default function SelectedUserHorizontal({
  users,
  onDeleteUserPressed,
}: {
  users: Amity.User[];
  onDeleteUserPressed: (user: Amity.User) => void;
}) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.x);
  };

  const handleMomentumScrollEnd = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: scrollOffset,
        y: 0,
        animated: true,
      });
    }
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      ref={scrollViewRef}
    >
      {users.map((user) => (
        <AvatarListItem
          key={user.userId}
          user={user}
          onDelete={() => onDeleteUserPressed(user)}
        />
      ))}
    </ScrollView>
  );
}
