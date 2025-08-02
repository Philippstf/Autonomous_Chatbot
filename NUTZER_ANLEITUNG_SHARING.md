# 🔗 HelferLain Chatbot Teilen - Nutzeranleitung

## 📋 Übersicht

Mit HelferLain können Sie Ihre Chatbots auf verschiedene Weise teilen und in Websites integrieren. Diese Anleitung zeigt Ihnen alle Möglichkeiten Schritt für Schritt.

## 🚀 Schnellstart: Chatbot öffentlich teilen

### 1. Chatbot-Liste öffnen
- Melden Sie sich in Ihrem HelferLain Account an
- Navigieren Sie zu "My Chatbots"
- Wählen Sie den Chatbot aus, den Sie teilen möchten

### 2. Share-Dialog öffnen
Es gibt zwei Wege:

**Option A: Über den Teilen-Button**
- Klicken Sie auf den blauen "Teilen" Button bei Ihrem Chatbot

**Option B: Über das Menü**
- Klicken Sie auf die drei Punkte (⋮) bei Ihrem Chatbot
- Wählen Sie "Teilen & Einbetten"

### 3. Öffentlichen Link kopieren
- Im Share-Dialog finden Sie unter "Öffentlicher Link" die Chat-URL
- Klicken Sie auf das Kopieren-Symbol 📋
- Der Link ist sofort verwendbar!

**Beispiel-Link:**
```
https://api.helferlain.app/chat/ihre-bot-id
```

### 4. Link teilen
- Per E-Mail verschicken
- In Social Media posten
- QR-Code generieren lassen
- Auf Ihrer Website verlinken

## 💻 Website-Integration

### Option 1: JavaScript Widget (Universal)

**Für alle Website-Typen geeignet**

1. **Code kopieren:**
   - Im Share-Dialog → Tab "Website Integration"
   - Kopieren Sie den HTML/JavaScript Code

2. **Code einfügen:**
```html
<!-- HelferLain Chatbot Widget -->
<script src="https://api.helferlain.app/widget.js"></script>
<script>
HelferLain.init({
  botId: 'ihre-bot-id',
  position: 'bottom-right',
  theme: 'light',
  autoOpen: false
});
</script>
```

3. **Platzierung:**
   - Code vor dem schließenden `</body>` Tag einfügen
   - Oder in den Header-Bereich Ihrer Website

### Option 2: WordPress Plugin

**Für WordPress-Websites**

1. **Plugin herunterladen:**
   - Im Share-Dialog → "Plugin herunterladen" klicken
   - Oder direkt von WordPress.org

2. **Plugin installieren:**
   - WordPress Admin → Plugins → Neu hinzufügen
   - Plugin hochladen → ZIP-Datei auswählen
   - Aktivieren

3. **Plugin konfigurieren:**
   - Einstellungen → HelferLain Chatbot
   - Bot ID eingeben (finden Sie im Share-Dialog)
   - Einstellungen speichern

4. **Shortcode verwenden:**
```
[helferlain_chatbot]
```

**Erweiterte Shortcodes:**
```
[helferlain_chatbot position="bottom-left" theme="dark"]
[helferlain_chatbot inline="true" width="500" height="600"]
[helferlain_chatbot auto_open="true"]
```

## 🎨 Anpassungsoptionen

### Widget-Position
- `bottom-right` (Standard)
- `bottom-left`
- `top-right`
- `top-left`

### Design-Themes
- `light` (Hell - Standard)
- `dark` (Dunkel)
- `auto` (Automatisch je nach System)

### Verhalten
- `autoOpen: true` - Chat öffnet sich automatisch
- `welcomeMessage: "Hallo!"` - Eigene Begrüßung
- `inline: true` - Chat direkt in Seite eingebettet

### Erweiterte Konfiguration
```javascript
HelferLain.init({
  botId: 'ihre-bot-id',
  position: 'bottom-right',
  theme: 'light',
  autoOpen: false,
  welcomeMessage: 'Hallo! Wie kann ich helfen?',
  width: 400,
  height: 600,
  analytics: true
});
```

## ⚙️ Einstellungen & Sicherheit

### Im Share-Dialog unter "Einstellungen":

1. **Freigabe-Status**
   - ☑️ "Öffentlich zugänglich" aktivieren für Sharing
   - ☐ Deaktiviert = Nur für Sie sichtbar

2. **Zugangs-Kontrolle**
   - ☑️ "Anonyme Benutzer erlauben" für öffentlichen Zugang
   - Zugangs-Passwort setzen (optional)

3. **Analytics & Tracking**
   - ☑️ "Analytics verfolgen" für Statistiken
   - ☑️ "HelferLain Branding anzeigen"

4. **Custom Domain** (Premium)
   - Eigene Domain verwenden: `chat.ihre-domain.de`

## 📊 Analytics & Monitoring

### Nutzer-Interaktionen verfolgen

1. **Dashboard öffnen:**
   - My Chatbots → Ihr Bot → Analytics

2. **Wichtige Metriken:**
   - 👥 Total Sessions
   - 💬 Total Messages  
   - ⭐ User Satisfaction
   - ✅ Resolution Rate
   - ⚡ Response Times

3. **Zeitfilter:**
   - Letzten 7 Tage
   - Letzten 30 Tage
   - Letzten 90 Tage
   - Letztes Jahr

### Export-Funktionen
- CSV-Export für detaillierte Analysen
- Session-Details einsehen
- Performance-Trends verfolgen

## 🔧 Troubleshooting

### Chat lädt nicht
1. **Bot ID prüfen:** Korrekte ID aus Share-Dialog kopiert?
2. **Freigabe-Status:** "Öffentlich zugänglich" aktiviert?
3. **Browser-Konsole:** F12 → Console → Fehlermeldungen prüfen

### Widget wird nicht angezeigt
1. **Script-Tag:** Korrekt vor `</body>` eingefügt?
2. **Bot ID:** Richtige ID verwendet?
3. **HTTPS:** Website verwendet HTTPS?

### WordPress Plugin funktioniert nicht
1. **Plugin aktiv:** Im WordPress Admin aktiviert?
2. **Bot ID:** In Plugin-Einstellungen eingetragen?
3. **Shortcode:** Korrekt geschrieben?

### Styling-Probleme
1. **CSS-Konflikte:** Theme-spezifische Anpassungen nötig?
2. **Z-Index:** Widget wird von anderen Elementen überdeckt?
3. **Responsive:** Mobile Darstellung prüfen?

## 💡 Best Practices

### Für optimale Nutzererfahrung:

1. **Begrüßungsnachricht personalisieren**
   ```
   "Hallo! Ich bin der Support-Bot von [Ihr Unternehmen]. 
   Wie kann ich Ihnen heute helfen?"
   ```

2. **Position strategisch wählen**
   - `bottom-right` für die meisten Websites
   - `bottom-left` bei rechts-lastigen Designs
   - Nicht den Haupt-CTA blockieren

3. **Auto-Open sparsam einsetzen**
   - Nur auf Landing Pages oder Support-Seiten
   - Nicht auf jeder Seite automatisch öffnen

4. **Theme passend wählen**
   - `light` für helle Websites
   - `dark` für dunkle Designs
   - `auto` für beste Kompatibilität

5. **Mobile Optimierung**
   - Widget funktioniert automatisch auf Mobile
   - Position `bottom-center` für kleine Bildschirme

## 🎯 Anwendungsfälle

### E-Commerce
```javascript
// Produkt-Support Bot
HelferLain.init({
  botId: 'product-support-bot',
  position: 'bottom-right',
  welcomeMessage: 'Fragen zu unseren Produkten? Ich helfe gerne!',
  autoOpen: false
});
```

### Kundenservice
```javascript
// 24/7 Support Bot
HelferLain.init({
  botId: 'customer-service-bot',
  position: 'bottom-left',
  theme: 'auto',
  welcomeMessage: 'Hallo! Unser Support ist 24/7 für Sie da.',
  autoOpen: true
});
```

### Lead-Generierung
```javascript
// Marketing Bot
HelferLain.init({
  botId: 'lead-gen-bot',
  position: 'bottom-right',
  welcomeMessage: 'Interesse an unseren Services? Lassen Sie uns sprechen!',
  analytics: true
});
```

## 📞 Support & Hilfe

Bei Problemen oder Fragen:

- **Help Center:** [docs.helferlain.app](https://docs.helferlain.app)
- **E-Mail Support:** support@helferlain.app
- **Community Forum:** [community.helferlain.app](https://community.helferlain.app)

## 🔄 Updates & Changelog

### Version 1.0
- ✅ Öffentliche Chat-Links
- ✅ JavaScript Widget
- ✅ WordPress Plugin
- ✅ Share-Modal im Management Interface
- ✅ Analytics Integration

### Geplante Features
- 🔮 Custom Domains (Premium)
- 🔮 A/B Testing für Widgets
- 🔮 Erweiterte Analytics
- 🔮 White-Label Optionen

---

**Viel Erfolg mit Ihrem HelferLain Chatbot!** 🚀

*Diese Anleitung wird regelmäßig aktualisiert. Letzte Aktualisierung: {{current_date}}*