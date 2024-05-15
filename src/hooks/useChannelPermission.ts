import { useMemo } from 'react';
import { Permissions } from './../constants';
import useAuth from './../hooks/useAuth';

export const useChannelPermission = (targetId: string) => {
  const { client } = useAuth();
  const hasChannelPermission = useMemo(() => {

    const channelPermission = (client as Amity.Client)
      ?.hasPermission(Permissions.AddChannelUserPermission).channel(targetId)
      channelPermission
 return channelPermission

  }, [client, targetId]);
  return hasChannelPermission;
};
