#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <SoftwareSerial.h>

const char* ssid     = "VOTRE_SSID";
const char* password = "VOTRE_MOT_DE_PASSE";

SoftwareSerial megaSerial(D6, D5); // RX, TX
ESP8266WebServer server(80);

void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void setup() {
  Serial.begin(9600);
  delay(100);
  
  megaSerial.begin(9600);
  
  Serial.println("\n=== ESP8266 ===");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  Serial.print("WiFi");
  int tentatives = 0;
  while (WiFi.status() != WL_CONNECTED && tentatives < 20) {
    delay(500);
    Serial.print(".");
    tentatives++;
    yield();
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nOK!");
    Serial.println("====================");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("====================");
  } else {
    Serial.println("\nECHEC WiFi!");
    return;
  }
  
  server.on("/", [](){
    addCORSHeaders();
    Serial.println("TEST OK");
    server.send(200, "text/plain", "OK");
  });
  
  server.on("/G", [](){
    addCORSHeaders();
    Serial.println("ENVOI: G");
    megaSerial.write('G');
    server.send(200, "text/plain", "G");
  });
  
  server.on("/D", [](){
    addCORSHeaders();
    Serial.println("ENVOI: D");
    megaSerial.write('D');
    server.send(200, "text/plain", "D");
  });
  
  server.on("/R", [](){
    addCORSHeaders();
    Serial.println("ENVOI: R");
    megaSerial.write('R');
    server.send(200, "text/plain", "R");
  });
  
  server.on("/U", [](){
    addCORSHeaders();
    Serial.println("ENVOI: U");
    megaSerial.write('U');
    server.send(200, "text/plain", "U");
  });
  
  server.on("/J", [](){
    addCORSHeaders();
    Serial.println("ENVOI: J");
    megaSerial.write('J');
    server.send(200, "text/plain", "J");
  });
  
  server.on("/L", [](){
    addCORSHeaders();
    Serial.println("ENVOI: L");
    megaSerial.write('L');
    server.send(200, "text/plain", "L");
  });
  
  server.on("/M", [](){
    addCORSHeaders();
    Serial.println("ENVOI: M");
    megaSerial.write('M');
    server.send(200, "text/plain", "M");
  });
  
  server.onNotFound([](){
    if (server.method() == HTTP_OPTIONS) {
      addCORSHeaders();
      server.send(200);
    } else {
      server.send(404, "text/plain", "404");
    }
  });
  
  server.begin();
  Serial.println("Serveur pret!\n");
}

void loop() {
  server.handleClient();
  yield();
  
  static unsigned long lastPing = 0;
  if (millis() - lastPing > 2000) {
    megaSerial.write('C');
    lastPing = millis();
  }
}