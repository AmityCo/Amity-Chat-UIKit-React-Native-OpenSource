/* eslint-disable no-catch-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { Client } from '@amityco/ts-sdk';
import type { AuthContextInterface } from '../types/auth.interface';
import { Alert } from 'react-native';
import type { IAmityUIkitProvider } from './amity-ui-kit-provider';

// const apiKey = 'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f';

export const AuthContext = React.createContext<AuthContextInterface>({
  client: {},
  isConnecting: false,
  error: '',
  login: () => { },
  logout: () => { },
  isConnected: false,
  sessionState: ''
});

export const AuthContextProvider: FC<IAmityUIkitProvider> = ({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
}: IAmityUIkitProvider) => {
  const [error, setError] = useState('');
  const [isConnecting, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState('');
  console.log('sessionState:', sessionState)
  console.log('isConnected:', isConnected)

  const client: Amity.Client = Client.createClient(apiKey, apiRegion, {
    apiEndpoint: { http: apiEndpoint },
  });

  console.log('client:', client)
  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal) {
      renewal.renew();
    },
  };


  useEffect(() => {
    return Client.onSessionStateChange((state: Amity.SessionStates) => setSessionState(state));
  }, []);

  useEffect(() => {
   if(sessionState === 'established'){
    Client.startUnreadSync();
    setIsConnected(true)
   }
  }, [sessionState])
  


  const handleConnect = async () => {
    const response = await Client.login(
      {
        userId: userId,
        displayName: displayName, // optional
      },
      sessionHandler
    );
 
    if (response) {
    console.log('response:', response)
    }
  };

  const login = async () => {
    setError('');
    setLoading(true);
    try {
   
      handleConnect();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      setError(errorText);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    login();
  }, [userId]);

  // TODO
  const logout = async () => {
    try {
      Client.stopUnreadSync();
      await Client.logout();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      Alert.alert(errorText);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        error,
        isConnecting,
        login,
        client,
        logout,
        isConnected,
        sessionState
      }}
    >
      {children}
    </AuthContext.Provider>
    //
  );
};
export default AuthContextProvider;
