import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

type Props = NativeStackScreenProps<any>;

const PasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { name, username } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!(password && confirmPassword) || password !== confirmPassword
      || !passwordRegex.test(password) || password.length < 8) {
      setValid(null);
      setError(!(password && confirmPassword) ? '' : password !== confirmPassword ? 'Passwords must match' :
        password.length < 8 ? 'Password must be at least 8 characters long' :
          'Password must contain at least one letter, one number, and one special character');
    }
    return;
  }, [password]);

  const handleRegister = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one letter, one number, and one special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        username,
        password,
      });

      console.log('name' + name + " username " + username + " password " + password);
      setLoading(false);
      navigation.navigate('Success', { username });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type matching passwords</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor='#b0b0b0'
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          maxLength={32}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#b0b3c6" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor='#b0b0b0'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          maxLength={32}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(v => !v)}>
          <Feather name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#b0b3c6" />
        </TouchableOpacity>
      </View>
      {checking && <ActivityIndicator size="small" color="#e03487" style={{ marginBottom: 8 }} />}
      {!checking && valid === true && password && (
        <Text style={styles.success}>You can have this username!</Text>
      )}
      {!checking && valid === false && username && (
        <Text style={styles.error}>You can't have this username...</Text>
      )}
      {!checking && error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity
        style={[styles.registerButton, { opacity: checking || valid === false || loading ? 0.6 : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
        onPress={handleRegister}
        disabled={checking || valid === false || loading}
      >
        <Text style={styles.registerButtonText}>Register</Text>
        {loading && (
          <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23243a',
    padding: 16,
  },
  label: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#b0b3c6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    outlineWidth: 0
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#e03487',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PasswordScreen; 