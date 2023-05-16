import * as React from 'react';
import { CategoryRepository, CommunityRepository } from '@amityco/ts-sdk';
import { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';

import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function Explore({ navigation }: any) {
  const [recommendCommunityList, setRecommendCommunityList] = useState<
    Amity.Community[]
  >([]);
  const [trendingCommunityList, setTrendingCommunityList] = useState<
    Amity.Community[]
  >([]);
  const [categoryList, setCategoryList] = useState<Amity.Category[]>([]);
  const loadRecommendCommunities = async () => {
    const { data: communities } =
      await CommunityRepository.getRecommendedCommunities();
    setRecommendCommunityList(communities);
  };
  const loadTrendingCommunities = async () => {
    const { data: communities } =
      await CommunityRepository.getTopTrendingCommunities();
    setTrendingCommunityList(communities);
  };
  const loadCategories = async () => {
    CategoryRepository.getCategories({}, ({ data: categories }) => {
      setCategoryList(categories);
    });
  };
  const handleCategoryListClick = () => {
    setTimeout(() => {
      navigation.navigate('CategoryList');
    }, 100);
  };
  const handleCommunityClick = (communityId: string, communityName: string) => {
    setTimeout(() => {
      navigation.navigate('CommunityHome', { communityId, communityName });
    }, 100);
  };
  useEffect(() => {
    loadRecommendCommunities();
    loadTrendingCommunities();
    loadCategories();
  }, []);
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setTimeout(() => {
      navigation.navigate('CommunityList', { categoryId, categoryName });
    }, 100);
  };
  const categoryListComponent = () => {
    const categoryElements = [];
    const maxLength = categoryList.length > 8 ? 8 : categoryList.length;
    for (let index = 0; index < maxLength; index += 2) {
      categoryElements.push(
        <View style={styles.rowContainer} key={index}>
          <TouchableOpacity
            style={styles.column}
            onPress={() =>
              handleCategoryClick(
                categoryList[index]!.categoryId,
                categoryList[index]!.name
              )
            }
          >
            <Image
              style={styles.avatar}
              source={
                categoryList[index]?.avatarFileId
                  ? {
                      uri: `https://api.amity.co/api/v3/files/${category.avatarFileId}/download`,
                    }
                  : require('../../../../assets/icon/Placeholder.png')
              }
            />
            <Text style={styles.columnText}>{categoryList[index]?.name}</Text>
          </TouchableOpacity>
          {index + 1 < categoryList.length && (
            <TouchableOpacity
              style={styles.column}
              onPress={() =>
                handleCategoryClick(
                  categoryList[index + 1]!.categoryId,
                  categoryList[index + 1]!.name
                )
              }
            >
              <Image
                style={styles.avatar}
                source={
                  categoryList[index + 1]?.avatarFileId
                    ? {
                        uri: `https://api.amity.co/api/v3/files/${
                          categoryList[index + 1]?.avatarFileId
                        }/download`,
                      }
                    : require('../../../../assets/icon/Placeholder.png')
                }
              />
              <Text style={styles.columnText}>
                {categoryList[index + 1]?.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return categoryElements;
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.recommendContainer}>
          <Text style={styles.title}>Recommended for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendCommunityList.map((community) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  handleCommunityClick(
                    community.communityId,
                    community.displayName
                  )
                }
              >
                <Image
                  style={styles.avatar}
                  source={{
                    uri: `https://api.amity.co/api/v3/files/${community.avatarFileId}/download`,
                  }}
                />
                <Text style={styles.name}>{community.displayName}</Text>
                <Text style={styles.recommendSubDetail}>
                  {community.membersCount} members
                </Text>
                <Text style={styles.bio}>{community.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.trendingContainer}>
          <Text style={styles.title}>Today's trending</Text>
          <View>
            {trendingCommunityList.map((community, index) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() =>
                  handleCommunityClick(
                    community.communityId,
                    community.displayName
                  )
                }
              >
                <Image
                  style={styles.avatar}
                  source={
                    community.avatarFileId
                      ? {
                          uri: `https://api.amity.co/api/v3/files/${community.avatarFileId}/download`,
                        }
                      : require('../../../../assets/icon/Placeholder.png')
                  }
                />
                <View style={styles.trendingTextContainer}>
                  <Text style={styles.number}>{index + 1}</Text>
                  <View style={styles.memberContainer}>
                    <View style={styles.memberTextContainer}>
                      <Text style={styles.memberText}>
                        {community.displayName}
                      </Text>
                      <Text style={styles.memberCount}>
                        {community.membersCount} members
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.categoriesContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Categories</Text>
            <TouchableOpacity onPress={handleCategoryListClick}>
              <Image
                source={require('../../../../assets/icon/arrowRight.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          </View>
          {categoryListComponent()}
          {/* {categoryList
            .filter((_, i) => i % 2 === 0)
            .map((category, index) => (
              <View style={styles.rowContainer} key={index}>
                <TouchableOpacity
                  style={styles.column}
                  onPress={() =>
                    handleCategoryClick(category.categoryId, category.name)
                  }
                >
                  <Text>{index}</Text>
                  <Image
                    style={styles.avatar}
                    source={
                      category.avatarFileId
                        ? {
                            uri: `https://api.amity.co/api/v3/files/${category.avatarFileId}/download`,
                          }
                        : require('../../../../assets/icon/Placeholder.png')
                    }
                  />
                  <Text style={styles.columnText}>{category.name}</Text>
                </TouchableOpacity>
                {index + 1 < categoryList.length && (
                  <TouchableOpacity
                    style={styles.column}
                    onPress={() =>
                      handleCategoryClick(
                        categoryList[index + 1]!.categoryId,
                        categoryList[index + 1]!.name
                      )
                    }
                  >
                    <Text>{index + 1}</Text>
                    <Image
                      style={styles.avatar}
                      source={
                        categoryList[index + 1]?.avatarFileId
                          ? {
                              uri: `https://api.amity.co/api/v3/files/${
                                categoryList[index + 1]?.avatarFileId
                              }/download`,
                            }
                          : require('../../../../assets/icon/Placeholder.png')
                      }
                    />
                    <Text style={styles.columnText}>
                      {categoryList[index + 1]?.name}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))} */}
        </View>
      </View>
    </ScrollView>
  );
}
