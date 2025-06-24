import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';

type Props = NativeStackScreenProps<any>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Replace with your actual login endpoint
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password,
            });
            setLoading(false);
            // Navigate to the next screen on success
            navigation.navigate('Success', { username });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Login to your account</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, {borderWidth: 0, marginBottom: 0}]}
                    placeholder="Username"
                    placeholderTextColor="#b0b3c6"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    maxLength={20}
                />
            </View>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { borderWidth: 0, marginBottom: 0 }]}
                    placeholder="Password"
                    placeholderTextColor="#b0b3c6"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    maxLength={32}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#b0b3c6" />
                </TouchableOpacity>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
                style={[styles.loginButton, { opacity: loading ? 0.6 : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.loginButtonText}>Login</Text>
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
    inputWrapper: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#b0b3c6',
        borderRadius: 14,
        padding: 6,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        width: '100%',
        fontSize: 16,
        color: '#fff',
        borderWidth: 0,
        borderColor: '#b0b3c6',
        borderRadius: 14,
        padding: 10,
        outlineWidth: 0,
    },
    eyeButton: {
        marginRight: 10
    },
    error: {
        color: 'red',
        marginBottom: 8,
        fontSize: 14,
    },
    loginButton: {
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
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
