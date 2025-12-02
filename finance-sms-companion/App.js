import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import axios from 'axios';

// REPLACE WITH YOUR COMPUTER'S IP ADDRESS
const API_URL = 'http://192.168.114.211:3000/api'; 

const SMS_TASK = 'SMS_BACKGROUND_TASK';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);

  useEffect(() => {
    checkSetupStatus();
    requestSMSPermission();
  }, []);

  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ]);
        
        const smsGranted = 
          granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;
        
        setSmsPermissionGranted(smsGranted);
        
        console.log('SMS Permission granted:', smsGranted);
        
        if (smsGranted) {
          Alert.alert(
            'SMS Permission Granted',
            'The app can now automatically capture bank transaction SMS.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'SMS Permission Required',
            'Please grant SMS permissions to enable automatic transaction capture.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.warn('SMS permission error:', err);
      }
    }
  };

  const checkSetupStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const setupComplete = await AsyncStorage.getItem('setupComplete');
      
      console.log('Setup check - Token:', !!token, 'Setup:', setupComplete);
      
      if (token && setupComplete === 'true') {
        setAuthToken(token);
        setIsSetup(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking setup:', error);
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    try {
      // QR code should contain: { token: 'user-auth-token', userId: 'user-id' }
      const qrData = JSON.parse(data);
      
      if (!qrData.token || !qrData.userId) {
        throw new Error('Invalid QR code format');
      }

      // Save auth token
      await AsyncStorage.setItem('authToken', qrData.token);
      await AsyncStorage.setItem('userId', qrData.userId);
      await AsyncStorage.setItem('setupComplete', 'true');
      
      setAuthToken(qrData.token);
      setIsSetup(true);
      
      // Register background task
      await registerBackgroundTask();
      
      Alert.alert(
        'Setup Complete!',
        'Your device is now linked. SMS will be automatically synced.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code. Please try again.');
      setScanned(false);
    }
  };

  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(SMS_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (err) {
      console.error('Task registration failed:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (isSetup) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✅ Setup Complete</Text>
        <Text style={styles.subtitle}>
          Your device is linked and SMS are being synced automatically.
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: Active</Text>
          <Text style={styles.infoText}>
            Device linked successfully.
          </Text>
          <Text style={[styles.infoText, { marginTop: 10, fontWeight: '600' }]}>
            SMS Permission: {smsPermissionGranted ? '✅ Granted' : '❌ Not Granted'}
          </Text>
          {!smsPermissionGranted && (
            <Text style={[styles.infoText, { color: '#EF4444', marginTop: 5 }]}>
              Please grant SMS permissions to capture transactions!
            </Text>
          )}
        </View>
        {!smsPermissionGranted && (
          <Button
            title="Grant SMS Permissions"
            color="#10B981"
            onPress={requestSMSPermission}
          />
        )}
        <View style={{ marginTop: 10 }} />
        <Button
          title="Unlink Device"
          color="#EF4444"
          onPress={async () => {
            await AsyncStorage.clear();
            setIsSetup(false);
            setAuthToken(null);
          }}
        />
      </View>
    );
  }

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera permission is required to scan the QR code.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finance SMS Companion</Text>
      <Text style={styles.subtitle}>
        Scan the QR code from your signup page to link this device
      </Text>
      
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      </View>
      
      {scanned && (
        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

// Background task to check for failed SMS and retry
TaskManager.defineTask(SMS_TASK, async () => {
  try {
    const failedSMS = await AsyncStorage.getItem('failedSMS');
    
    if (failedSMS) {
      const failed = JSON.parse(failedSMS);
      const token = await AsyncStorage.getItem('authToken');
      
      // Retry failed SMS
      for (const item of failed) {
        try {
          await axios.post(
            `${API_URL}/transactions/sms-webhook`,
            { smsText: item.smsData.body, sender: item.smsData.address },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
      
      // Clear failed SMS after retry
      await AsyncStorage.setItem('failedSMS', '[]');
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  scannerContainer: {
    width: 300,
    height: 300,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    width: '100%',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
});
