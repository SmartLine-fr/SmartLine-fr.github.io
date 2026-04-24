import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Animated, Image, TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

// Base64 pur JS — pas besoin de module natif
const uint8ToBase64 = (bytes) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i+1] ?? 0, b2 = bytes[i+2] ?? 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i+1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i+2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return result;
};
import {
  ChevronRight, ChevronLeft, RotateCcw, ChevronUp, ChevronDown,
  X, Circle, Wifi, Camera,
} from 'lucide-react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen({ userRole, onLogout }) {
  const [mode, setMode] = useState('auto');
  const [status, setStatus] = useState('Système opérationnel');
  const [espIP, setEspIP] = useState('192.168.X.X'); // Adresse IP de l'ESP8266 sur votre réseau
  const [showIPInput, setShowIPInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const GEMINI_API_KEY = 'VOTRE_CLE_API_GEMINI'; // Remplacer par votre clé Google AI Studio

  // Demande permission notifications au montage
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notifications', 'Activez les notifications pour recevoir les alertes trafic.');
      }
    })();
  }, []);

  // Démarre/arrête l'analyse automatique
  useEffect(() => {
    if (autoAnalysis) {
      analyzeTraffic(); // analyse immédiate au démarrage
      intervalRef.current = setInterval(() => {
        analyzeTraffic();
      }, 60000); // toutes les 60 secondes
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoAnalysis]);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sendCommand = async (route) => {
    try {
      setStatus("Envoi...");
      const response = await fetch(`http://${espIP}/${route}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
      });
      if (response.ok) {
        const text = await response.text();
        setStatus(`✅ ${text}`);
      } else {
        setStatus(`❌ Erreur ${response.status}`);
      }
      setTimeout(() => setStatus("Système opérationnel"), 2000);
    } catch (error) {
      setStatus("❌ Connexion impossible");
      setTimeout(() => setStatus("Système opérationnel"), 2000);
    }
  };

  const testConnection = async () => {
    try {
      setStatus("Test connexion...");
      const response = await fetch(`http://${espIP}/`, { method: 'GET' });
      if (response.ok) {
        setStatus("✅ ESP connecté!");
        setShowIPInput(false);
      } else {
        setStatus("❌ ESP non trouvé");
      }
      setTimeout(() => setStatus("Système opérationnel"), 2000);
    } catch (error) {
      setStatus("❌ Vérifiez l'IP");
      setTimeout(() => setStatus("Système opérationnel"), 2000);
    }
  };

  const analyzeTraffic = async () => {
    try {
      setAnalyzing(true);
      setAiResult(null);

      // 1. Snapshot JPEG depuis l'ESP32
      const imgResponse = await fetch(`http://${espIP}/capture`);
      if (!imgResponse.ok) throw new Error('Snapshot impossible');
      const arrayBuffer = await imgResponse.arrayBuffer();
      const base64 = uint8ToBase64(new Uint8Array(arrayBuffer));

      // 2. Envoi à Gemini Flash (gratuit)
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64,
                  },
                },
                {
                  text: `Tu es un système d'analyse de trafic routier. Analyse cette image et réponds UNIQUEMENT en JSON, sans texte autour, sans backticks :
{
  "bouchon_gauche": "aucun | léger | modéré | dense",
  "bouchon_droite": "aucun | léger | modéré | dense",
  "voitures_visibles": <nombre entier>,
  "recommandation": "<action courte en français>",
  "alerte": true ou false
}`,
                },
              ],
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
          }),
        }
      );

      const data = await geminiResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);
      setAiResult(result);
      setLastAnalysis(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

      // Envoie une notification si alerte ou trafic dense
      if (result.alerte || result.bouchon_gauche === 'dense' || result.bouchon_droite === 'dense') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Alerte trafic SmartLine',
            body: result.recommandation || 'Bouchon détecté, adaptation des voies recommandée.',
            sound: true,
          },
          trigger: null, // immédiat
        });
      }
    } catch (e) {
      setAiResult({ error: e.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAction = (action) => {
    if (!isAdmin) {
      Alert.alert('Accès restreint', 'Action nécessite admin', [{ text: 'OK' }]);
      return;
    }
    switch(action) {
      case 'Extend Right': sendCommand('Scénario A'); break;
      case 'Extend Left':  sendCommand('Scénario B'); break;
      case 'Reset':        sendCommand('Rénitialiser'); break;
      case 'Lift':         sendCommand('Lever'); break;
      case 'Down':         sendCommand('Baisser'); break;
      case 'Left':         sendCommand('Gauche'); break;
      case 'Right':        sendCommand('Droite'); break;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMini}>
              <Image source={require('../assets/logo.PNG')} style={styles.logoImage} />
            </View>
            <View>
              <Text style={styles.headerTitle}>SmartLine</Text>
              <Text style={styles.headerRole}>{isAdmin ? 'Administrateur' : 'Invité'}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowCamera(!showCamera)} style={styles.wifiButton}>
              <Camera color={showCamera ? '#00ff00' : '#ffffff'} size={18} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowIPInput(!showIPInput)} style={styles.wifiButton}>
              <Wifi color="#ffffff" size={18} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.closeButton}>
              <X color="#ffffff" size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── IP Config ── */}
        {showIPInput && (
          <View style={styles.ipConfig}>
            <Text style={styles.ipLabel}>IP de l'ESP32-CAM</Text>
            <TextInput
              style={styles.ipInput}
              value={espIP}
              onChangeText={setEspIP}
              placeholder="192.168.X.X"
              placeholderTextColor="#666"
              keyboardType="numbers-and-punctuation"
            />
            <TouchableOpacity style={styles.testButton} onPress={testConnection}>
              <Text style={styles.testButtonText}>Tester la connexion</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Flux Caméra ── */}
        {showCamera && (
          <View style={styles.cameraContainer}>
            <WebView
              key={espIP}
              source={{ uri: `http://${espIP}/` }}
              style={styles.cameraView}
              scrollEnabled={false}
              originWhitelist={['*']}
              mixedContentMode="always"
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              onError={(e) => console.log('WebView error:', e.nativeEvent)}
            />
            <View style={styles.cameraBadge}>
              <View style={styles.cameraDot} />
              <Text style={styles.cameraBadgeText}>LIVE • {espIP}</Text>
            </View>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Statut ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>État du système</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isAdmin ? '#00ff00' : '#ffaa00' }]} />
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>
          </View>

          {/* ── Analyse IA ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Analyse IA du trafic</Text>

            <TouchableOpacity
              style={[styles.aiButton, analyzing && styles.aiButtonLoading]}
              onPress={analyzeTraffic}
              disabled={analyzing}
              activeOpacity={0.8}
            >
              <Text style={styles.aiButtonText}>
                {analyzing ? 'Analyse en cours...' : 'Analyser le trafic'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.autoButton, autoAnalysis && styles.autoButtonActive]}
              onPress={() => setAutoAnalysis(!autoAnalysis)}
              activeOpacity={0.8}
            >
              <View style={[styles.autoDot, autoAnalysis && styles.autoDotActive]} />
              <Text style={[styles.autoButtonText, autoAnalysis && styles.autoButtonTextActive]}>
                {autoAnalysis ? 'Analyse auto : ON  (1 min)' : 'Analyse auto : OFF'}
              </Text>
            </TouchableOpacity>

            {lastAnalysis && (
              <Text style={styles.lastAnalysisText}>Dernière analyse : {lastAnalysis}</Text>
            )}

            {aiResult && !aiResult.error && (
              <View style={styles.aiCard}>
                <View style={styles.aiRow}>
                  <View style={styles.aiSide}>
                    <Text style={styles.aiSideLabel}>← GAUCHE</Text>
                    <View style={[styles.aiLevel,
                      aiResult.bouchon_gauche === 'aucun'   && styles.levelGreen,
                      aiResult.bouchon_gauche === 'léger'   && styles.levelYellow,
                      aiResult.bouchon_gauche === 'modéré'  && styles.levelOrange,
                      aiResult.bouchon_gauche === 'dense'   && styles.levelRed,
                    ]}>
                      <Text style={styles.aiLevelText}>{aiResult.bouchon_gauche?.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.aiCenter}>
                    <Text style={styles.aiCount}>{aiResult.voitures_visibles}</Text>
                    <Text style={styles.aiCountLabel}>véhicules</Text>
                  </View>

                  <View style={styles.aiSide}>
                    <Text style={styles.aiSideLabel}>DROITE →</Text>
                    <View style={[styles.aiLevel,
                      aiResult.bouchon_droite === 'aucun'   && styles.levelGreen,
                      aiResult.bouchon_droite === 'léger'   && styles.levelYellow,
                      aiResult.bouchon_droite === 'modéré'  && styles.levelOrange,
                      aiResult.bouchon_droite === 'dense'   && styles.levelRed,
                    ]}>
                      <Text style={styles.aiLevelText}>{aiResult.bouchon_droite?.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                {aiResult.alerte && (
                  <View style={styles.alertBox}>
                    <Text style={styles.alertText}>ALERTE TRAFIC</Text>
                  </View>
                )}

                <View style={styles.recommendBox}>
                  <Text style={styles.recommendLabel}>Recommandation</Text>
                  <Text style={styles.recommendText}>{aiResult.recommandation}</Text>
                </View>
              </View>
            )}

            {aiResult?.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Erreur : {aiResult.error}</Text>
              </View>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mode de contrôle</Text>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'auto' && styles.modeActive]}
                onPress={() => setMode('auto')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeText, mode === 'auto' && styles.modeTextActive]}>Automatique</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'manual' && styles.modeActive]}
                onPress={() => setMode('manual')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>Manuel</Text>
              </TouchableOpacity>
            </View>
            {!isAdmin && (
              <View style={styles.infoBox}>
                <Circle color="#ffaa00" size={10} strokeWidth={2} fill="#ffaa00" />
                <Text style={styles.infoText}>Visualisation uniquement</Text>
              </View>
            )}
          </View>

          {/* ── Contrôles ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {mode === 'auto' ? 'Contrôle des voies' : 'Contrôle manuel'}
            </Text>

            {mode === 'auto' ? (
              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={[styles.controlCard, !isAdmin && styles.controlDisabled]}
                  onPress={() => handleAction('Extend Right')}
                  disabled={!isAdmin}
                  activeOpacity={0.7}
                >
                  <View style={styles.controlContent}>
                    <View style={styles.controlIcon}>
                      <ChevronRight color={isAdmin ? '#000' : '#555'} size={24} strokeWidth={2} />
                    </View>
                    <View style={styles.controlText}>
                      <Text style={[styles.controlTitle, !isAdmin && styles.controlTitleDisabled]}>Scénario A</Text>
                      <Text style={styles.controlDescription}>Auto Gauche</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, styles.controlCardAlt, !isAdmin && styles.controlDisabled]}
                  onPress={() => handleAction('Reset')}
                  disabled={!isAdmin}
                  activeOpacity={0.7}
                >
                  <View style={styles.controlContent}>
                    <View style={styles.controlIconAlt}>
                      <RotateCcw color={isAdmin ? '#fff' : '#555'} size={24} strokeWidth={2} />
                    </View>
                    <View style={styles.controlText}>
                      <Text style={[styles.controlTitleAlt, !isAdmin && styles.controlTitleDisabled]}>Réinitialiser</Text>
                      <Text style={styles.controlDescription}>Position initiale</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, !isAdmin && styles.controlDisabled]}
                  onPress={() => handleAction('Extend Left')}
                  disabled={!isAdmin}
                  activeOpacity={0.7}
                >
                  <View style={styles.controlContent}>
                    <View style={styles.controlIcon}>
                      <ChevronLeft color={isAdmin ? '#000' : '#555'} size={24} strokeWidth={2} />
                    </View>
                    <View style={styles.controlText}>
                      <Text style={[styles.controlTitle, !isAdmin && styles.controlTitleDisabled]}>Scénario B</Text>
                      <Text style={styles.controlDescription}>Auto Droite</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.controlsContainer}>
                <View style={styles.directionGrid}>
                  <TouchableOpacity
                    style={[styles.directionCard, !isAdmin && styles.controlDisabled]}
                    onPress={() => handleAction('Lift')}
                    disabled={!isAdmin}
                    activeOpacity={0.7}
                  >
                    <ChevronUp color={isAdmin ? '#fff' : '#555'} size={28} strokeWidth={2} />
                    <Text style={[styles.directionText, !isAdmin && styles.controlTitleDisabled]}>Lever</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.directionCard, !isAdmin && styles.controlDisabled]}
                    onPress={() => handleAction('Down')}
                    disabled={!isAdmin}
                    activeOpacity={0.7}
                  >
                    <ChevronDown color={isAdmin ? '#fff' : '#555'} size={28} strokeWidth={2} />
                    <Text style={[styles.directionText, !isAdmin && styles.controlTitleDisabled]}>Baisser</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.directionGrid}>
                  <TouchableOpacity
                    style={[styles.directionCard, !isAdmin && styles.controlDisabled]}
                    onPress={() => handleAction('Left')}
                    disabled={!isAdmin}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft color={isAdmin ? '#fff' : '#555'} size={28} strokeWidth={2} />
                    <Text style={[styles.directionText, !isAdmin && styles.controlTitleDisabled]}>Gauche</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.directionCard, !isAdmin && styles.controlDisabled]}
                    onPress={() => handleAction('Right')}
                    disabled={!isAdmin}
                    activeOpacity={0.7}
                  >
                    <ChevronRight color={isAdmin ? '#fff' : '#555'} size={28} strokeWidth={2} />
                    <Text style={[styles.directionText, !isAdmin && styles.controlTitleDisabled]}>Droite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {!isAdmin && (
            <View style={styles.guestNotice}>
              <Text style={styles.guestTitle}>Accès lecture seule</Text>
              <Text style={styles.guestText}>Connectez-vous en admin pour effectuer des actions.</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  wrapper: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', gap: 12 },
  logoMini: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center',
  },
  logoImage: { width: 34, height: 34, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  headerRole: { fontSize: 12, fontWeight: '500', color: '#666666' },
  wifiButton: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  closeButton: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  ipConfig: {
    backgroundColor: '#0f0f0f', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  ipLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8 },
  ipInput: {
    backgroundColor: '#1a1a1a', color: '#fff',
    padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#00ff00', padding: 12, borderRadius: 8, alignItems: 'center',
  },
  testButtonText: { color: '#000', fontSize: 14, fontWeight: '700' },

  // ── Caméra ──
  cameraContainer: {
    height: 220,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    position: 'relative',
  },
  cameraView: { flex: 1, backgroundColor: '#000' },
  cameraBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cameraDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff3333' },
  cameraBadgeText: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },

  content: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#666666',
    textTransform: 'uppercase', marginBottom: 14, letterSpacing: 0.5,
  },
  statusCard: {
    backgroundColor: '#0f0f0f', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: '#1a1a1a',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  modeContainer: {
    flexDirection: 'row', backgroundColor: '#0f0f0f', borderRadius: 12,
    padding: 4, borderWidth: 1, borderColor: '#1a1a1a', gap: 4,
  },
  modeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  modeActive: { backgroundColor: '#ffffff' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666666' },
  modeTextActive: { color: '#000000' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, padding: 14, backgroundColor: '#0f0f0f',
    borderRadius: 10, borderWidth: 1, borderColor: '#1a1a1a',
  },
  infoText: { fontSize: 12, fontWeight: '500', color: '#888888', flex: 1 },
  controlsContainer: { gap: 12 },
  controlCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 18 },
  controlCardAlt: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#1a1a1a' },
  controlDisabled: { opacity: 0.4 },
  controlContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  controlIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
  },
  controlIconAlt: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  controlText: { flex: 1 },
  controlTitle: { fontSize: 16, fontWeight: '700', color: '#000000', marginBottom: 3 },
  controlTitleAlt: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 3 },
  controlTitleDisabled: { color: '#666666' },
  controlDescription: { fontSize: 13, fontWeight: '500', color: '#666666' },
  directionGrid: { flexDirection: 'row', gap: 12 },
  directionCard: {
    flex: 1, backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#1a1a1a',
    borderRadius: 14, padding: 24, alignItems: 'center', gap: 8,
  },
  directionText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  guestNotice: {
    backgroundColor: '#0f0f0f', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: '#1a1a1a', marginTop: 8,
  },
  guestTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  guestText: { fontSize: 13, fontWeight: '500', color: '#888888', lineHeight: 19 },

  // ── IA ──
  aiButton: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 18, alignItems: 'center',
  },
  aiButtonLoading: { backgroundColor: '#1a1a1a' },
  aiButtonText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  autoButton: {
    marginTop: 10, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#1a1a1a',
  },
  autoButtonActive: { borderColor: '#00ff00' },
  autoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  autoDotActive: { backgroundColor: '#00ff00' },
  autoButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  autoButtonTextActive: { color: '#00ff00' },
  lastAnalysisText: { fontSize: 11, color: '#444', marginTop: 8, textAlign: 'center' },
  aiCard: {
    marginTop: 14, backgroundColor: '#0f0f0f', borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: '#1a1a1a', gap: 14,
  },
  aiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiSide: { flex: 1, alignItems: 'center', gap: 8 },
  aiSideLabel: { fontSize: 10, fontWeight: '700', color: '#666', letterSpacing: 0.5 },
  aiCenter: { alignItems: 'center' },
  aiCount: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  aiCountLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  aiLevel: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center',
  },
  aiLevelText: { fontSize: 11, fontWeight: '800', color: '#000' },
  levelGreen:  { backgroundColor: '#00ff00' },
  levelYellow: { backgroundColor: '#ffee00' },
  levelOrange: { backgroundColor: '#ff8800' },
  levelRed:    { backgroundColor: '#ff2222' },
  alertBox: {
    backgroundColor: '#ff2222', borderRadius: 10, padding: 12, alignItems: 'center',
  },
  alertText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  recommendBox: {
    backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14,
  },
  recommendLabel: { fontSize: 10, fontWeight: '700', color: '#666', marginBottom: 6, textTransform: 'uppercase' },
  recommendText: { fontSize: 14, fontWeight: '600', color: '#ffffff', lineHeight: 20 },
  errorBox: {
    marginTop: 12, backgroundColor: '#1a0000', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#ff2222',
  },
  errorText: { fontSize: 13, fontWeight: '500', color: '#ff6666' },
});