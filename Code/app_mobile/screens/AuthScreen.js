import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, TextInput, Alert, ScrollView, Vibration } from 'react-native';
import { Shield, User, ArrowRight, Lock } from 'lucide-react-native';

const ADMIN_CODE = '2580';

export default function AuthScreen({ onAuth }) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinDots, setPinDots] = useState([false, false, false, false]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const dots = pin.split('').map(() => true);
    while (dots.length < 4) dots.push(false);
    setPinDots(dots);
  }, [pin]);

  const handleAdminPress = () => {
    setShowPinInput(true);
    setPin('');
  };

  const handlePinSubmit = () => {
    if (pin === ADMIN_CODE) {
      Vibration.vibrate(50);
      onAuth('admin');
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
      Alert.alert('Erreur', 'Code incorrect');
      setPin('');
    }
  };

  const handleBack = () => {
    setShowPinInput(false);
    setPin('');
  };

  if (showPinInput) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.pinHeader}>
            <View style={styles.logoMini}>
              <Image source={require('../assets/logo.PNG')} style={styles.logoImage} />
            </View>
            
            <Text style={styles.pinTitle}>Code Administrateur</Text>
            <Text style={styles.pinSubtitle}>Entrez votre code à 4 chiffres</Text>
          </View>

          <View style={styles.pinContainer}>
            <View style={styles.pinDotsContainer}>
              {pinDots.map((filled, index) => (
                <View
                  key={index}
                  style={[styles.pinDot, filled && styles.pinDotFilled]}
                />
              ))}
            </View>

            <TextInput
              style={styles.hiddenInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={4}
              autoFocus
              secureTextEntry
              onSubmitEditing={handlePinSubmit}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                pin.length === 4 && styles.submitButtonActive
              ]}
              onPress={handlePinSubmit}
              disabled={pin.length !== 4}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {pin.length === 4 ? 'Valider' : 'Entrez le code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/logo.PNG')} style={styles.logo} />
            </View>
            
            <Text style={styles.title}>SmartLine</Text>
            <Text style={styles.subtitle}>Contrôle du système</Text>
          </View>

          <View style={styles.cardsContainer}>
            {/* Admin Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={handleAdminPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Shield color="#000000" size={20} strokeWidth={2} />
                </View>
                <View style={styles.badge}>
                  <Lock color="#666666" size={10} strokeWidth={2} />
                  <Text style={styles.badgeText}>Sécurisé</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>Administrateur</Text>
              <Text style={styles.cardDescription}>
                Accès complet au système avec contrôle des commandes
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.footerLabel}>Code requis</Text>
                <ArrowRight color="#999999" size={16} strokeWidth={2} />
              </View>
            </TouchableOpacity>

            {/* Guest Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardGuest]}
              onPress={() => onAuth('guest')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapperGuest}>
                  <User color="#ffffff" size={20} strokeWidth={2} />
                </View>
                <View style={styles.badgeGuest}>
                  <Text style={styles.badgeTextGuest}>Lecture seule</Text>
                </View>
              </View>

              <Text style={styles.cardTitleGuest}>Mode Invité</Text>
              <Text style={styles.cardDescriptionGuest}>
                Visualisation complète sans modification possible
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.footerLabelGuest}>Accès direct</Text>
                <ArrowRight color="#666666" size={16} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>SmartLine © 2025</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
  },
  cardGuest: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperGuest: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeGuest: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
  },
  badgeTextGuest: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  cardTitleGuest: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardDescriptionGuest: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
  footerLabelGuest: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
  },
  // PIN Screen
  pinHeader: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoMini: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  pinContainer: {
    gap: 28,
    alignItems: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#333333',
    backgroundColor: '#0a0a0a',
  },
  pinDotFilled: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#ffffff',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  backButton: {
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});