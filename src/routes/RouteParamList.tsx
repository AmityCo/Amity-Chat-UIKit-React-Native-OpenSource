import type { UserInterface } from '../types/user.interface';
import type { IGroupChatObject } from '../components/ChatList';

export type RootStackParamList = {
  SelectMembers: undefined;
  Second: undefined;
  ChatRoom: {
    channelId: string;
    chatReceiver?: UserInterface;
    groupChat?: IGroupChatObject;
  };
  RecentChat: undefined;
  ChatDetail: {
    channelId: string,
    channelType: string,
    chatReceiver?: UserInterface;
    groupChat?: IGroupChatObject;
  };
  MemberDetail: undefined;
  EditChatDetail:  {
    channelId: string,
    groupChat?: IGroupChatObject;
  };
};
