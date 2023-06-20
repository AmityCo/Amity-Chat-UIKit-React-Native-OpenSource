import { CommunityRepository } from '@amityco/ts-sdk';
import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, View, Text, ActivityIndicator, Image } from 'react-native';
import { styles } from './styles';
import CloseButton from '../../../components/BackButton';

export default function CommunityList({ navigation, route }: any) {
  const [communities, setCommunities] = useState<Amity.Community[]>([]);
  const [paginateLoading, setPaginateLoading] = useState(false);
  const { categoryId, categoryName } = route.params;
  const [hasNextPage, setHasNextPage] = useState(false);

  const onNextPageRef = useRef<(() => void) | null>(null);
  const isFetchingRef = useRef(false);
  const onEndReachedCalledDuringMomentumRef = useRef(true);
  React.useLayoutEffect(() => {
    // Set the headerRight component to a TouchableOpacity
    navigation.setOptions({
      headerLeft: () => <CloseButton navigation={navigation} />,
      title: categoryName,
      // eslint-disable-next-line react/no-unstable-nested-components
    });
  }, [navigation]);
  useEffect(() => {
    const loadCommunities = async () => {
      setPaginateLoading(true);
      console.log('enter load communities ' + categoryId);
      try {
        const unsubscribe = CommunityRepository.getCommunities(
          { categoryId: categoryId },
          ({ data: communities, onNextPage, hasNextPage, loading, error }) => {
            if (!loading) {
              setCommunities((prevCommunities) => [
                ...prevCommunities,
                ...communities,
              ]);
              console.log(
                'did query communities ' + JSON.stringify(communities)
              );
              setHasNextPage(hasNextPage);
              onNextPageRef.current = onNextPage;
              isFetchingRef.current = false;
              unsubscribe();
            }
          }
        );
      } catch (error) {
        console.error('Failed to load communities:', error);
        isFetchingRef.current = false;
      } finally {
        setPaginateLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const renderCommunity = ({ item }: { item: Amity.Community }) => {
    return (
      <View style={styles.rowContainer}>
        <Image
          style={styles.avatar}
          source={
            item.avatarFileId
              ? {
                  uri: `https://api.amity.co/api/v3/files/${item.avatarFileId}/download`,
                }
              : require('../../../../assets/icon/Placeholder.png')
          }
        />
        <Text style={styles.categoryText}>{item.displayName}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!paginateLoading) return null;
    return (
      <View style={styles.LoadingIndicator}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const handleEndReached = useCallback(() => {
    console.log('handleEndReached got triggered');
    if (
      !isFetchingRef.current &&
      hasNextPage &&
      !onEndReachedCalledDuringMomentumRef.current
    ) {
      isFetchingRef.current = true;
      onEndReachedCalledDuringMomentumRef.current = true;
      onNextPageRef.current && onNextPageRef.current();
    }
  }, [hasNextPage]);

  return (
    <View style={styles.container}>
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.communityId.toString()}
        ListFooterComponent={renderFooter}
        // onEndReached={handleEndReached}
        onEndReached={handleEndReached}
        onMomentumScrollBegin={() =>
          (onEndReachedCalledDuringMomentumRef.current = false)
        }
        onEndReachedThreshold={0.8}
      />
    </View>
  );
}
