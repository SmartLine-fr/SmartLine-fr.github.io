#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <U8g2lib.h>

// ================= OLED =================
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2_hw(U8G2_R0, U8X8_PIN_NONE);
U8G2_SH1106_128X64_NONAME_F_SW_I2C u8g2_sw(U8G2_R0, 29, 37, U8X8_PIN_NONE);

// ================= LED STRIPS =================
#define PIN1 52
#define PIN2 53
#define NUM_LEDS 30
Adafruit_NeoPixel strip1(NUM_LEDS, PIN1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2(NUM_LEDS, PIN2, NEO_GRB + NEO_KHZ800);

// ================= MOTEURS DC =================
const int motor1Input1 = 4;
const int motor1Input2 = 5;
const int motor2Input1 = 6;
const int motor2Input2 = 7;

// ================= PLATEAU =================
const int plateau_IN1 = 22;
const int plateau_IN2 = 23;
const int plateau_IN3 = 24;
const int plateau_IN4 = 25;

int stepIndex = 0;
unsigned long lastStepTime = 0;
const int pasDelay = 40;

const int pasSequence[4][4] = {
  {1,0,1,0},
  {0,1,1,0},
  {0,1,0,1},
  {1,0,0,1}
};

// ================= CAPTEURS ULTRASON =================
const int TRIG_RED1 = 31;
const int ECHO_RED1 = 32;
const int TRIG_RED2 = 33;
const int ECHO_RED2 = 34;
const int TRIG_RAJ1 = 26;
const int ECHO_RAJ1 = 27;
const int TRIG_RAJ2 = 28;
const int ECHO_RAJ2 = 30;

const float DISTANCE_SECURITE = 5.0;
bool systemeBloque = false;

// ================= SETUP =================
void setup() {
  Serial.begin(9600);   // Debug USB
  Serial2.begin(9600);  // Communication ESP8266

  strip1.begin();
  strip2.begin();
  strip1.show();
  strip2.show();

  Wire.begin();
  u8g2_hw.begin();
  pinMode(37, INPUT_PULLUP);
  pinMode(29, INPUT_PULLUP);
  u8g2_sw.begin();
  u8g2_hw.setFont(u8g2_font_unifont_t_symbols);
  u8g2_sw.setFont(u8g2_font_unifont_t_symbols);

  pinMode(motor1Input1, OUTPUT);
  pinMode(motor1Input2, OUTPUT);
  pinMode(motor2Input1, OUTPUT);
  pinMode(motor2Input2, OUTPUT);

  pinMode(plateau_IN1, OUTPUT);
  pinMode(plateau_IN2, OUTPUT);
  pinMode(plateau_IN3, OUTPUT);
  pinMode(plateau_IN4, OUTPUT);

  pinMode(TRIG_RED1, OUTPUT);
  pinMode(ECHO_RED1, INPUT);
  pinMode(TRIG_RED2, OUTPUT);
  pinMode(ECHO_RED2, INPUT);
  pinMode(TRIG_RAJ1, OUTPUT);
  pinMode(ECHO_RAJ1, INPUT);
  pinMode(TRIG_RAJ2, OUTPUT);
  pinMode(ECHO_RAJ2, INPUT);

  Serial.println("=== MEGA PRET ===");
  Serial.println("En attente ESP...");
}

// ================= FONCTIONS CAPTEURS =================

float lireDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duree = pulseIn(echoPin, HIGH, 30000);
  return (duree == 0) ? 999 : (duree * 0.034 / 2);
}

bool verifierSecuriteReduction() {
  float d1 = lireDistance(TRIG_RED1, ECHO_RED1);
  float d2 = lireDistance(TRIG_RED2, ECHO_RED2);
  
  if (d1 <= DISTANCE_SECURITE || d2 <= DISTANCE_SECURITE) {
    if (!systemeBloque) {
      Serial.println("⚠️ ARRÊT - Obstacle RÉDUCTION!");
      systemeBloque = true;
      arreterMoteurDC();
    }
    return false;
  }
  
  if (systemeBloque) {
    Serial.println("✅ Reprise");
    systemeBloque = false;
  }
  return true;
}

bool verifierSecuriteRajout() {
  float d3 = lireDistance(TRIG_RAJ1, ECHO_RAJ1);
  float d4 = lireDistance(TRIG_RAJ2, ECHO_RAJ2);
  
  if (d3 <= DISTANCE_SECURITE || d4 <= DISTANCE_SECURITE) {
    if (!systemeBloque) {
      Serial.println("⚠️ ARRÊT - Obstacle RAJOUT!");
      systemeBloque = true;
      arreterMoteurDC();
    }
    return false;
  }
  
  if (systemeBloque) {
    Serial.println("✅ Reprise");
    systemeBloque = false;
  }
  return true;
}

// ================= FONCTIONS DE BASE =================

void arreterTout(){
  digitalWrite(motor1Input1, LOW);
  digitalWrite(motor1Input2, LOW);
  digitalWrite(motor2Input1, LOW);
  digitalWrite(motor2Input2, LOW);
  digitalWrite(plateau_IN1, LOW);
  digitalWrite(plateau_IN2, LOW);
  digitalWrite(plateau_IN3, LOW);
  digitalWrite(plateau_IN4, LOW);
}

void arreterMoteurDC(){
  digitalWrite(motor1Input1, LOW);
  digitalWrite(motor1Input2, LOW);
  digitalWrite(motor2Input1, LOW);
  digitalWrite(motor2Input2, LOW);
}

void stepPlateauMotor(bool sensHoraire, unsigned long durationMillis){
  unsigned long start = millis();
  while (millis() - start < durationMillis) {
    if (millis() - lastStepTime >= pasDelay) {
      lastStepTime = millis();
      int direction = sensHoraire ? 1 : -1;
      stepIndex = (stepIndex + direction + 4) % 4;
      digitalWrite(plateau_IN1, pasSequence[stepIndex][0]);
      digitalWrite(plateau_IN2, pasSequence[stepIndex][1]);
      digitalWrite(plateau_IN3, pasSequence[stepIndex][2]);
      digitalWrite(plateau_IN4, pasSequence[stepIndex][3]);
    }
  }
}

void stopPlateau(){
  digitalWrite(plateau_IN1, LOW);
  digitalWrite(plateau_IN2, LOW);
  digitalWrite(plateau_IN3, LOW);
  digitalWrite(plateau_IN4, LOW);
}

// ================= LED & OLED =================

void allumerCouleur(Adafruit_NeoPixel& strip, uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}

void reduire(U8G2 &disp) {
  disp.clearBuffer();
  const char *l1 = "** Attention **";
  const char *l2 = "réduction";
  const char *l3 = "de voie";
  int x1 = (128 - disp.getUTF8Width(l1)) / 2;
  int x2 = (128 - disp.getUTF8Width(l2)) / 2;
  int x3 = (128 - disp.getUTF8Width(l3)) / 2;
  disp.drawUTF8(x1, 16, l1);
  disp.drawUTF8(x2, 32, l2);
  disp.drawUTF8(x3, 48, l3);
  disp.sendBuffer();
}

void ajouter(U8G2 &disp) {
  disp.clearBuffer();
  const char *l1 = "** Attention **";
  const char *l2 = "Rajout";
  const char *l3 = "de voie";
  int x1 = (128 - disp.getUTF8Width(l1)) / 2;
  int x2 = (128 - disp.getUTF8Width(l2)) / 2;
  int x3 = (128 - disp.getUTF8Width(l3)) / 2;
  disp.drawUTF8(x1, 16, l1);
  disp.drawUTF8(x2, 32, l2);
  disp.drawUTF8(x3, 48, l3);
  disp.sendBuffer();
}

void bonneroute(U8G2 &disp) {
  disp.clearBuffer();
  const char *w1 = "Bonne";
  const char *w2 = "Route";
  int x1 = (128 - disp.getUTF8Width(w1)) / 2;
  int x2 = (128 - disp.getUTF8Width(w2)) / 2;
  disp.drawUTF8(x1, 32, w1);
  disp.drawUTF8(x2, 48, w2);
  disp.sendBuffer();
}

// ================= MOTEURS DC AVEC SECURITE =================

void moteurDroite_avecSecurite() {
  // 🔥 DROITE = capteurs RAJOUT actifs
  digitalWrite(motor1Input1, LOW);
  digitalWrite(motor1Input2, HIGH);
  digitalWrite(motor2Input1, LOW);
  digitalWrite(motor2Input2, HIGH);
  
  unsigned long start = millis();
  while (millis() - start < 5000) {
    if (!verifierSecuriteRajout()) {
      arreterMoteurDC();
      while (!verifierSecuriteRajout()) {
        delay(100);
      }
      digitalWrite(motor1Input1, LOW);
      digitalWrite(motor1Input2, HIGH);
      digitalWrite(motor2Input1, LOW);
      digitalWrite(motor2Input2, HIGH);
    }
    delay(50);
  }
}

void moteurGauche_avecSecurite() {
  // 🔥 GAUCHE = capteurs RÉDUCTION actifs
  digitalWrite(motor1Input1, HIGH);
  digitalWrite(motor1Input2, LOW);
  digitalWrite(motor2Input1, HIGH);
  digitalWrite(motor2Input2, LOW);
  
  unsigned long start = millis();
  while (millis() - start < 5000) {
    if (!verifierSecuriteReduction()) {
      arreterMoteurDC();
      while (!verifierSecuriteReduction()) {
        delay(100);
      }
      digitalWrite(motor1Input1, HIGH);
      digitalWrite(motor1Input2, LOW);
      digitalWrite(motor2Input1, HIGH);
      digitalWrite(motor2Input2, LOW);
    }
    delay(50);
  }
}

// ================= SCENARIOS =================

void scenarioA(){
  Serial.println(">>> SCENARIO A (Lever → DROITE → Baisser)");
  
  // 🔥 DROITE bouge : strip2 VERT, strip1 ROUGE
  allumerCouleur(strip1, 255, 0, 0);  // Gauche = Rouge
  allumerCouleur(strip2, 0, 255, 0);  // Droite = Vert (bouge)
  ajouter(u8g2_hw);
  ajouter(u8g2_sw);
  
  // Lever
  stepPlateauMotor(true, 4000);
  stopPlateau();
  
  // DROITE avec capteurs RAJOUT
  moteurDroite_avecSecurite();
  arreterMoteurDC();
  
  // Baisser
  stepPlateauMotor(false, 4000);
  stopPlateau();
  
  // Clignotement LED
  for (int i = 0; i < 3; i++) {
    allumerCouleur(strip1, 0, 0, 0);
    allumerCouleur(strip2, 0, 0, 0);
    delay(500);
    allumerCouleur(strip1, 255, 0, 0);
    allumerCouleur(strip2, 0, 255, 0);
    delay(500);
  }
  
  // Éteindre + Bonne Route
  allumerCouleur(strip1, 0, 0, 0);
  allumerCouleur(strip2, 0, 0, 0);
  bonneroute(u8g2_hw);
  bonneroute(u8g2_sw);
  
  Serial.println("<<< FIN A");
}

void scenarioB(){
  Serial.println(">>> SCENARIO B (Lever → GAUCHE → Baisser)");
  
  // 🔥 GAUCHE bouge : strip1 VERT, strip2 ROUGE
  allumerCouleur(strip1, 0, 255, 0);  // Gauche = Vert (bouge)
  allumerCouleur(strip2, 255, 0, 0);  // Droite = Rouge
  reduire(u8g2_hw);
  reduire(u8g2_sw);
  
  // Lever
  stepPlateauMotor(true, 4000);
  stopPlateau();
  
  // GAUCHE avec capteurs RÉDUCTION
  moteurGauche_avecSecurite();
  arreterMoteurDC();
  
  // Baisser
  stepPlateauMotor(false, 4000);
  stopPlateau();
  
  // Clignotement LED
  for (int i = 0; i < 3; i++) {
    allumerCouleur(strip1, 0, 0, 0);
    allumerCouleur(strip2, 0, 0, 0);
    delay(500);
    allumerCouleur(strip1, 0, 255, 0);
    allumerCouleur(strip2, 255, 0, 0);
    delay(500);
  }
  
  // Éteindre + Bonne Route
  allumerCouleur(strip1, 0, 0, 0);
  allumerCouleur(strip2, 0, 0, 0);
  bonneroute(u8g2_hw);
  bonneroute(u8g2_sw);
  
  Serial.println("<<< FIN B");
}

void reinitialiserSysteme(){
  Serial.println(">>> RESET");
  arreterTout();
  stepPlateauMotor(false, 4000);
  stopPlateau();
  allumerCouleur(strip1, 0, 0, 0);
  allumerCouleur(strip2, 0, 0, 0);
  bonneroute(u8g2_hw);
  bonneroute(u8g2_sw);
  Serial.println("<<< FIN RESET");
}

// ================= MODE MANUEL =================

void leverPlateau(){
  Serial.println(">>> LEVER");
  stepPlateauMotor(true, 3000);
  stopPlateau();
  Serial.println("<<< FIN LEVER");
}

void baisserPlateau(){
  Serial.println(">>> BAISSER");
  stepPlateauMotor(false, 3000);
  stopPlateau();
  Serial.println("<<< FIN BAISSER");
}

void moteurGauche(){
  Serial.println(">>> MANUEL GAUCHE");
  
  // 🔥 GAUCHE bouge : strip1 VERT, strip2 ROUGE
  allumerCouleur(strip1, 0, 255, 0);  // Gauche = Vert (bouge)
  allumerCouleur(strip2, 255, 0, 0);  // Droite = Rouge
  
  digitalWrite(motor1Input1, HIGH);
  digitalWrite(motor1Input2, LOW);
  digitalWrite(motor2Input1, HIGH);
  digitalWrite(motor2Input2, LOW);
  
  unsigned long start = millis();
  while (millis() - start < 3000) {
    if (!verifierSecuriteReduction()) {
      arreterMoteurDC();
      while (!verifierSecuriteReduction()) {
        delay(100);
      }
      digitalWrite(motor1Input1, HIGH);
      digitalWrite(motor1Input2, LOW);
      digitalWrite(motor2Input1, HIGH);
      digitalWrite(motor2Input2, LOW);
    }
    delay(50);
  }
  
  arreterMoteurDC();
  allumerCouleur(strip1, 0, 0, 0);
  allumerCouleur(strip2, 0, 0, 0);
  Serial.println("<<< FIN GAUCHE");
}

void moteurDroite(){
  Serial.println(">>> MANUEL DROITE");
  
  // 🔥 DROITE bouge : strip2 VERT, strip1 ROUGE
  allumerCouleur(strip1, 255, 0, 0);  // Gauche = Rouge
  allumerCouleur(strip2, 0, 255, 0);  // Droite = Vert (bouge)
  
  digitalWrite(motor1Input1, LOW);
  digitalWrite(motor1Input2, HIGH);
  digitalWrite(motor2Input1, LOW);
  digitalWrite(motor2Input2, HIGH);
  
  unsigned long start = millis();
  while (millis() - start < 3000) {
    if (!verifierSecuriteRajout()) {
      arreterMoteurDC();
      while (!verifierSecuriteRajout()) {
        delay(100);
      }
      digitalWrite(motor1Input1, LOW);
      digitalWrite(motor1Input2, HIGH);
      digitalWrite(motor2Input1, LOW);
      digitalWrite(motor2Input2, HIGH);
    }
    delay(50);
  }
  
  arreterMoteurDC();
  allumerCouleur(strip1, 0, 0, 0);
  allumerCouleur(strip2, 0, 0, 0);
  Serial.println("<<< FIN DROITE");
}

// ================= LOOP =================

void loop(){
  if (Serial2.available()) {
    char cmd = Serial2.read();
    
    Serial.print("COMMANDE RECUE: ");
    Serial.println(cmd);
    
    switch(cmd){
      case 'G': scenarioA(); break;  // Scénario A = DROITE
      case 'D': scenarioB(); break;  // Scénario B = GAUCHE
      case 'R': reinitialiserSysteme(); break;
      case 'U': leverPlateau(); break;
      case 'J': baisserPlateau(); break;
      case 'L': moteurGauche(); break;
      case 'M': moteurDroite(); break;
      case 'C': break; // Signal ping ESP
      default:
        Serial.print("COMMANDE INCONNUE: ");
        Serial.println(cmd);
    }
  }
}