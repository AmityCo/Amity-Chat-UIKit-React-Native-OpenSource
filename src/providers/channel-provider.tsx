import {
  runQuery,
  createQuery,
  createChannel,
  updateChannel,
  leaveChannel,
  queryChannelMembers,
  ChannelRepository,
} from '@amityco/ts-sdk';

import { getAmityUser } from './user-provider';
import { uploadFile } from './file-provider';
import type { UserInterface } from 'src/types/user.interface';

export async function createAmityChannel(
  currentUserID: string,
  users: UserInterface[]
): Promise<Amity.Channel> {
  return await new Promise(async (resolve, reject) => {
    if (users.length < 1) {
      return reject(new Error('Insufficient member count'));
    }
    console.log('currentUserID:', currentUserID)
    console.log('check user object list ' + JSON.stringify(users));
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
    console.log('check channel param ' + JSON.stringify(param));


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
    const query = createQuery(leaveChannel, channelID);
    runQuery(query, (result) => {
      if (result.loading == false) {
        if (result.error == undefined) {
          console.log('leave channel success ' + JSON.stringify(result.data));
          return resolve(result.data);
        } else {
          return reject(new Error('Unable to leave channel ' + result.error));
        }
      }
    });
  });
}

export async function updateAmityChannel(
  channelID: string,
  imagePath: string | undefined,
  displayName: string | undefined
): Promise<Amity.Channel | undefined> {
  let option = {};
  let fileId: string | undefined = undefined;
  if (imagePath) {
    fileId = await uploadFile(imagePath);
  }
  console.log('check display name ' + displayName + ' ' + imagePath);
  return await new Promise(async (resolve, reject) => {
    if (imagePath && !displayName) {
      option = {
        avatarFileId: fileId,
      };
    } else if (!imagePath && displayName) {
      option = {
        displayName: displayName,
      };
    } else if (imagePath && displayName) {
      option = {
        displayName: displayName,
        avatarFileId: fileId,
      };
    } else {
      return reject(
        new Error(
          'Display name and image path is missing' +
          imagePath +
          ' --- ' +
          displayName
        )
      );
    }
    const query = createQuery(updateChannel, channelID, option);

    runQuery(query, (result) => {
      if (result.loading == false) {
        if (result.error == undefined) {
          console.log('update channel success ' + JSON.stringify(result.data));
          return resolve(result.data);
        } else {
          return reject(new Error('Unable to create channel ' + result.error));
        }
      }
    });
  });
}

export async function queryChannelMember(
  setUserListOptions: (
    options: Amity.RunQueryOptions<typeof queryChannelMembers>
  ) => void,
  channelID: string,
  nextPage = { limit: 20 },
  displayName?: string
): Promise<Amity.Membership<'channel'>[]> {
  let param: Amity.QueryChannelMembers = {
    channelId: channelID,
    memberships: ['member'],
    sortBy: 'lastCreated',
    page: nextPage,
  };
  if (displayName != undefined && displayName != '') {
    param.search = displayName;
  }

  return await new Promise((resolve, reject) => {
    runQuery(
      createQuery(queryChannelMembers, param),
      ({ data: members, ...options }) => {
        setUserListOptions(options);

        if (options.loading == false) {
          if (members !== undefined) {
            setUserListOptions(options);
            return resolve(members);
          } else {
            return reject(
              new Error('Unable to get user data ' + options.error)
            );
          }
        }
      }
    );
  });
}
