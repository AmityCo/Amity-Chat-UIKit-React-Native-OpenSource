import { FileRepository } from '@amityco/ts-sdk';

import { Platform } from 'react-native';

export async function uploadFile(
  filePath: string,
  perCentCallback?: (percent: number) => void
): Promise<Amity.File<any>[]> {
  return await new Promise(async (resolve, reject) => {
    const formData = new FormData();
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const fileType = Platform.OS === 'ios' ? 'image/jpeg' : 'image/jpg';
    const uri =
      Platform.OS === 'android' ? filePath : filePath.replace('file://', '');

    formData.append('files', {
      name: fileName,
      type: fileType,
      uri: uri,
    });

    const { data: file } = await FileRepository.uploadFile(
      formData,
      (percent) => {
        perCentCallback && perCentCallback(percent);
      }
    );
    if (file) {
      resolve(file);
    } else {
      reject('Upload error');
    }
  });
}

export async function uploadImageFile(
  filePath: string,
  perCentCallback?: (percent: number) => void
): Promise<Amity.File<any>[]> {
  return await new Promise(async (resolve, reject) => {
    const formData = new FormData();
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const fileType = Platform.OS === 'ios' ? 'image/jpeg' : 'image/jpg';
    const uri =
      Platform.OS === 'android' ? filePath : filePath.replace('file://', '');

    formData.append('files', {
      name: fileName,
      type: fileType,
      uri: uri,
    });

    const { data: file } = await FileRepository.uploadImage(
      formData,
      (percent) => {
        perCentCallback && perCentCallback(percent);
      }
    );
    if (file) {
      resolve(file);
    } else {
      reject('Upload error');
    }
  });
}