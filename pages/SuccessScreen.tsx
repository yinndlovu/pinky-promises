import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

const SuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { username } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Successful!</Text>
      <Text style={styles.subtitle}>Welcome, {username}!</Text>
      <Button title="Go to Home" onPress={() => { "Welcome" }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
  },
});

export default SuccessScreen; 