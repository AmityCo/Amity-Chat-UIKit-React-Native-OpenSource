import type { UserInterface } from '../types/user.interface';
import type { IGroupChatObject } from '../components/ChatList';

export type RootStackParamList = {
  Home: undefined;
  SelectMembers: undefined;
  Second: undefined;
  ChatRoom: {
    channelId: string;
    chatReceiver?: UserInterface;
    groupChat?: IGroupChatObject;
  };
  RecentChat: undefined;
  ChatDetail: undefined;
  MemberDetail: undefined;
  EditChatDetail: undefined;
};
