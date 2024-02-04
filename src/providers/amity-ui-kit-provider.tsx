import * as React from 'react';

import AuthContextProvider from './auth-provider';
import { MenuProvider } from 'react-native-popup-menu';
export interface IAmityUIkitProvider {
  userId: string;
  displayName: string;
  apiKey: string;
  apiRegion?: string;
  apiEndpoint?: string;
  children: any;
}
export default function AmityUiKitProvider({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
}: IAmityUIkitProvider) {
  return (
    <AuthContextProvider
      userId={userId}
      displayName={displayName || userId}
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
    >
      <MenuProvider>
        {children}
      </MenuProvider>
    </AuthContextProvider>

  );
}
