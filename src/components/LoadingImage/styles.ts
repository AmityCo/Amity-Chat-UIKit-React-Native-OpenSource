import { Dimensions, StyleSheet } from 'react-native';

export const createStyles = () => {
  return StyleSheet.create({

    container: {
      marginVertical: 15,
    },
    imageContainer: {
      position: 'relative',
      margin: 3,
    },
    image: {
      resizeMode: 'cover',
      maxWidth: 350,
      maxHeight: 220,
      width:   Dimensions.get('window').width /2,
      height: Dimensions.get('window').width /3.25,
      borderRadius: 10,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 6
    },
    progressBar: {
      marginVertical: 10,
    },
    loadingImage: {
      opacity: 0.5,
    },
    loadedImage: {
      opacity: 1,
    },
    closeButton: {
      position: 'absolute',
      top: 7,
      right: 7,
      padding: 7,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: 72,
    },
    loadingRow: {
      flexDirection: 'row',
      paddingTop: 4,
    },
    loadingText: {
      marginRight: 10,
    },
  });
};
