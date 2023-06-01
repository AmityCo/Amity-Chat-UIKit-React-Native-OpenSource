import { CategoryRepository } from '@amityco/ts-sdk';
import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { styles } from './styles';
import CloseButton from '../../../components/BackButton';

export default function CategoryList({ navigation }: any) {
  const [categories, setCategories] = useState<Amity.Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const onNextPageRef = useRef<(() => void) | null>(null);
  const isFetchingRef = useRef(false);
  const onEndReachedCalledDuringMomentumRef = useRef(true);
  React.useLayoutEffect(() => {
    // Set the headerRight component to a TouchableOpacity
    navigation.setOptions({
      headerLeft: () => <CloseButton navigation={navigation} />,
      // eslint-disable-next-line react/no-unstable-nested-components
    });
  }, [navigation]);
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const unsubscribe = CategoryRepository.getCategories(
          {},
          ({ data: categories, onNextPage, hasNextPage, loading, error }) => {
            console.log('check all categories ' + JSON.stringify(categories));
            if (!loading) {
              setCategories((prevCategories) => [
                ...prevCategories,
                ...categories,
              ]);
              console.log('did query catgories ');
              setHasNextPage(hasNextPage);
              onNextPageRef.current = onNextPage;
              isFetchingRef.current = false;
              unsubscribe();
            }
          }
        );
      } catch (error) {
        console.error('Failed to load categories:', error);
        isFetchingRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setTimeout(() => {
      navigation.navigate('CommunityList', { categoryId, categoryName });
    }, 100);
  };
  const renderCategory = ({ item }: { item: Amity.Category }) => {
    return (
      <TouchableOpacity
        style={styles.rowContainer}
        onPress={() => handleCategoryClick(item.categoryId, item.name)}
      >
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
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
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
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.categoryId.toString()}
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
