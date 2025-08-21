import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import DatabaseService from '../../services/DatabaseService';
import { QrCode, Camera, Type, Search } from 'lucide-react-native';

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const router = useRouter();

  const handleBarcodeScanned = async (data: string) => {
    if (!scanning) return;

    setScanning(false);
    try {
      const machine = await DatabaseService.getMachineByBarcode(data);
      if (machine) {
        router.push({
          pathname: '/checklist',
          params: { machineId: machine.id.toString() }
        });
      } else {
        Alert.alert(
          'Machine Not Found',
          `No machine found with barcode: ${data}`,
          [{ text: 'OK', onPress: () => setScanning(true) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process barcode');
      setScanning(true);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return;

    try {
      const machine = await DatabaseService.getMachineByBarcode(manualCode.trim());
      if (machine) {
        router.push({
          pathname: '/checklist',
          params: { machineId: machine.id.toString() }
        });
      } else {
        Alert.alert('Machine Not Found', `No machine found with code: ${manualCode}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to find machine');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <QrCode size={64} color="#6B7280" />
          <Text style={styles.message}>Camera permission is required to scan barcodes</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showManualInput) {
    return (
      <View style={styles.container}>
        <View style={styles.manualInputContainer}>
          <Text style={styles.manualInputTitle}>Enter Barcode Manually</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter machine barcode (e.g., CNC001)"
              placeholderTextColor="#9CA3AF"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleManualSubmit}
            >
              <Search size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setShowManualInput(false)}
          >
            <Camera size={20} color="#2563EB" />
            <Text style={styles.switchButtonText}>Use Camera Instead</Text>
          </TouchableOpacity>

          <View style={styles.demoCodesContainer}>
            <Text style={styles.demoCodesTitle}>Demo Barcodes:</Text>
            {['CNC001', 'LAT002', 'MIL003'].map((code) => (
              <TouchableOpacity
                key={code}
                style={styles.demoCodeButton}
                onPress={() => setManualCode(code)}
              >
                <Text style={styles.demoCodeText}>{code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanning ? ({ data }) => handleBarcodeScanned(data) : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>

          <Text style={styles.instructionText}>
            {scanning ? 'Point camera at machine barcode' : 'Processing...'}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
            >
              <Camera size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => setShowManualInput(true)}
            >
              <Type size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#16A34A',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#16A34A',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#16A34A',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#16A34A',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  manualButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginVertical: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  manualInputContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  manualInputTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    marginBottom: 32,
  },
  switchButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  demoCodesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  demoCodesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  demoCodeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  demoCodeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
});