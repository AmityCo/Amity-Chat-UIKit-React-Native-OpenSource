import {
  ChannelRepository,
} from '@amityco/ts-sdk-react-native';

import { getAmityUser } from './user-provider';
import type { UserInterface } from 'src/types/user.interface';
import { Alert } from 'react-native';


export async function createAmityChannel(
  currentUserID: string,
  users: UserInterface[]
): Promise<Amity.Channel> {
  return await new Promise(async (resolve, reject) => {
    if (users.length < 1) {
      return reject(new Error('Insufficient member count'));
    }

    let channelType: Amity.ChannelType =
      users.length > 1 ? 'community' : 'conversation';
    let userIds: string[] = [currentUserID];
    const { userObject } = await getAmityUser(currentUserID);
    let displayName = userObject.data.displayName! + ', ';
    displayName += users.map((user) => user.displayName).join(', ');
    userIds.push(...users.map((user) => user.userId));
    const param = {
      displayName: displayName,
      type: channelType,
      userIds: userIds,
    };


    const { data: channel,  } = await ChannelRepository.createChannel(param);
    if(channel){
      resolve(channel)
    }else{
      reject(' Create Channel unsuccessful')
    }
    console.log('param:', param)
  });
}

export async function leaveAmityChannel(
  channelID: string
): Promise<boolean | undefined> {
  return await new Promise(async (resolve, reject) => {
    try {
      const didLeaveChannel = await ChannelRepository.leaveChannel(channelID);
      if(didLeaveChannel){
        resolve(true)
      }
      
    } catch (error) {
      Alert.alert('Unable to leave channel due to ' + error, '', []);
      reject(new Error('Unable to leave channel ' + error));
    }

  });
}

export async function updateAmityChannel(
  channelID: string,
  fileId: string,
  displayName: string | undefined
): Promise<Amity.Channel | undefined> {
  let option = {};


  return await new Promise(async (resolve, reject) => {
    if (fileId && !displayName) {
      option = {
        avatarFileId: fileId,
      };
    } else if (!fileId && displayName) {
      option = {
        displayName: displayName,
      };
    } else if (fileId && displayName) {
      option = {
        displayName: displayName,
        avatarFileId: fileId,
      };
    } else {
      return reject(
        new Error(
          'Display name and image path is missing' +
          fileId +
          ' --- ' +
          displayName
        )
      );
    }
    try {
      console.log(option)
      const {data} = await ChannelRepository.updateChannel(channelID, option);
      console.log('updateChannel:', data)
      if(data){
    
         resolve(data);
      }
    } catch (error) {
      reject(new Error('Unable to create channel ' + error));
    }
   

  });
}



