import * as React from 'react';

import { View, Button, StyleSheet } from 'react-native';
import useAuth from '../../hooks/useAuth';

export default function Home() {
  const { client, logout } = useAuth();

  const clickLogin = () => {
    console.log('clientID: ', (client as Amity.Client).userId);
  };
  const clickLogout = () => {
    logout();
  };
  return (
    <View style={styles.container}>
      <Button title="Login" onPress={clickLogin} />
      <Button title="Logout" onPress={clickLogout} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
