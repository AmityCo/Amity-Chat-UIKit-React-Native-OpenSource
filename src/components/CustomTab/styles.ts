import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBECEF',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 78,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1054DE',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 90,
    height: 2,
    backgroundColor: '#1054DE',
  },
});
