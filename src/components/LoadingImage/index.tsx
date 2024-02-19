import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, type StyleProp, type ImageStyle } from 'react-native';
import * as Progress from 'react-native-progress';
import {
  uploadImageFile,
} from '../../providers/file-provider';
import { createStyles } from './styles';

interface OverlayImageProps {
  source: string;
  onClose?: (originalPath: string) => void;
  onLoadFinish?: (
    fileId: string,
    originalPath: string
  ) => void;
  index?: number;
  isUploaded?: boolean;
  fileId?: string;
  isShowSending?: boolean
  containerStyle?: StyleProp<ImageStyle> | StyleProp<ImageStyle>;
}
const LoadingImage = ({
  source,
  onLoadFinish,
  isShowSending = true,
  containerStyle
}: OverlayImageProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [isFinish, setIsFinish] = useState(false)
  const styles = createStyles();

  const handleLoadEnd = () => {
    setLoading(false);
  };
  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {

    if (!isFinish ) {
      const file: Amity.File<any>[] = await uploadImageFile(
        source,
        (percent: number) => {
          setProgress(percent);
          console.log('percent:', percent)
        },
        true

      );
      if (file) {
        setIsFinish(true)
        setIsProcess(false);
        handleLoadEnd();
        onLoadFinish &&
          onLoadFinish(
            file[0]?.fileId as string,
            source
          );
      }
    }

  }, [isFinish]);

  useEffect(() => {
    if (isFinish) {
      setLoading(false);
    } else {
      uploadFileToAmity();
    }
  }, [isFinish]);

  return (
    <View key={source} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: source }}
          style={[
            containerStyle ? containerStyle : styles.image,
            loading ? styles.loadingImage : styles.loadedImage,
          ]}
        />
        {loading && (
          <View style={styles.overlay}>
            {isProcess ? (
              <Progress.CircleSnail size={60} borderColor="transparent" />
            ) : (
              <Progress.Circle
                progress={progress / 100}
                size={60}
                borderColor="transparent"
                unfilledColor="#ffffff"
              />
            )}
          </View>
        )}

      </View>
      {isShowSending && loading && <View style={styles.loadingRow}>
        <Text style={styles.loadingText}>sending</Text>
        <ActivityIndicator size={20} color={'gray'} />
      </View>}
    </View>
  );
};
export default LoadingImage;
