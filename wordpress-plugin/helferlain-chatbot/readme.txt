=== HelferLain Chatbot ===
Contributors: helferlain
Tags: chatbot, ai, customer-support, chat, widget
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Integriere deinen HelferLain KI-Chatbot nahtlos in deine WordPress Website mit einfachen Shortcodes.

== Description ==

**HelferLain Chatbot** ermöglicht es dir, deinen personalisierten KI-Chatbot von HelferLain einfach und schnell in deine WordPress Website zu integrieren.

### 🚀 Hauptfunktionen

* **Einfache Integration**: Ein Shortcode genügt - `[helferlain_chatbot]`
* **Flexibles Design**: Verschiedene Positionen, Themes und Anpassungsoptionen
* **Inline & Popup**: Sowohl eingebettete als auch schwebende Chat-Widgets
* **Responsive**: Funktioniert perfekt auf Desktop, Tablet und Mobile
* **Analytics**: Integrierte Tracking-Funktionen für Chatbot-Performance
* **WordPress-optimiert**: Kompatibel mit allen gängigen Themes und Page-Buildern

### 🎯 Anwendungsfälle

* **Kundenservice**: 24/7 automatisierte Kundenbetreuung
* **FAQ-Automatisierung**: Häufige Fragen automatisch beantworten
* **Lead-Generierung**: Potentielle Kunden erfassen und qualifizieren
* **Support-Entlastung**: Routine-Anfragen automatisch bearbeiten
* **Produktberatung**: Kunden bei der Produktauswahl unterstützen

### 🛠️ Einfache Einrichtung

1. **Plugin installieren** und aktivieren
2. **Bot ID** aus deinem HelferLain Dashboard eintragen
3. **Shortcode platzieren**: `[helferlain_chatbot]` wo du möchtest
4. **Fertig!** Dein Chatbot ist live

### 📋 Shortcode-Optionen

```
[helferlain_chatbot]
[helferlain_chatbot bot_id="deine-bot-id"]
[helferlain_chatbot position="bottom-left" theme="dark"]
[helferlain_chatbot inline="true" width="500" height="600"]
[helferlain_chatbot auto_open="true" welcome_message="Hallo! Wie kann ich helfen?"]
```

### 🎨 Anpassungsoptionen

* **Position**: bottom-right, bottom-left, top-right, top-left
* **Theme**: light, dark, auto
* **Größe**: Anpassbare Breite und Höhe für Inline-Chats
* **Verhalten**: Automatisches Öffnen, Begrüßungsnachrichten
* **Styling**: Custom CSS für vollständige Design-Kontrolle

### 🔧 Erweiterte Funktionen

* **Conditional Display**: Chatbot nur auf bestimmten Seiten anzeigen
* **Analytics Integration**: Tracking von Chat-Metriken und Conversions
* **Multi-Bot Support**: Verschiedene Bots für verschiedene Seiten
* **A/B Testing**: Verschiedene Konfigurationen testen
* **Custom Events**: JavaScript-Events für erweiterte Integrationen

### 🏗️ Theme & Page Builder Kompatibilität

* ✅ **Gutenberg** (WordPress Block Editor)
* ✅ **Elementor**
* ✅ **Divi**
* ✅ **WPBakery**
* ✅ **Beaver Builder**
* ✅ **Alle gängigen WordPress Themes**

### 🔐 Datenschutz & Sicherheit

* **DSGVO-konform**: Alle Chats werden sicher verarbeitet
* **Keine Drittanbieter-Tracking**: Nur notwendige Analytics
* **Sichere API**: Verschlüsselte Kommunikation mit HelferLain Servern
* **Lokale Konfiguration**: Sensitive Daten bleiben auf deinem Server

== Installation ==

### Automatische Installation

1. Gehe zu **Plugins > Neu hinzufügen** in deinem WordPress Admin
2. Suche nach "HelferLain Chatbot"
3. Klicke **Jetzt installieren** und dann **Aktivieren**
4. Gehe zu **Einstellungen > HelferLain Chatbot**
5. Trage deine Bot ID ein (aus dem HelferLain Dashboard)
6. Speichere die Einstellungen

### Manuelle Installation

1. Lade die Plugin-Dateien in den `/wp-content/plugins/helferlain-chatbot/` Ordner hoch
2. Aktiviere das Plugin über das **Plugins** Menü in WordPress
3. Folge den Schritten 4-6 von oben

### Nach der Installation

1. **Bot erstellen**: Gehe zu [HelferLain.app](https://helferlain.app) und erstelle deinen Chatbot
2. **Bot ID kopieren**: Kopiere die Bot ID aus dem HelferLain Dashboard
3. **Plugin konfigurieren**: Trage die Bot ID in den Plugin-Einstellungen ein
4. **Shortcode verwenden**: Platziere `[helferlain_chatbot]` auf deinen Seiten

== Frequently Asked Questions ==

= Benötige ich einen HelferLain Account? =

Ja, du benötigst einen kostenlosen Account bei HelferLain.app um Chatbots zu erstellen. Das Plugin selbst ist kostenlos, aber der Chatbot-Service läuft über HelferLain.

= Kann ich mehrere Chatbots verwenden? =

Ja! Du kannst verschiedene Bot IDs für verschiedene Seiten oder Bereiche deiner Website verwenden:
`[helferlain_chatbot bot_id="bot-1"]`
`[helferlain_chatbot bot_id="bot-2"]`

= Funktioniert das Plugin mit meinem Theme? =

Das Plugin ist für maximale Kompatibilität entwickelt und funktioniert mit allen Standard-WordPress-Themes. Bei Problemen kontaktiere unseren Support.

= Kann ich das Design anpassen? =

Ja! Du kannst Custom CSS in den Plugin-Einstellungen hinzufügen oder die integrierten Theme-Optionen (light/dark) verwenden.

= Wie kann ich den Chatbot nur auf bestimmten Seiten anzeigen? =

Du hast mehrere Optionen:
1. **Global deaktivieren** und nur Shortcodes verwenden
2. **Seiten ausschließen** in den Plugin-Einstellungen
3. **Conditional Shortcodes** mit WordPress-Funktionen

= Welche Daten werden erfasst? =

Nur notwendige Chat-Daten werden an HelferLain übertragen. Alle Daten werden DSGVO-konform verarbeitet. Details findest du in der HelferLain Datenschutzerklärung.

= Funktioniert das Plugin auf mobilen Geräten? =

Ja! Das Chat-Widget ist vollständig responsive und optimiert für mobile Geräte.

= Kann ich Analytics und Tracking deaktivieren? =

Ja, du kannst Analytics in den Plugin-Einstellungen deaktivieren.

== Screenshots ==

1. **Plugin-Einstellungen** - Einfache Konfiguration im WordPress Admin
2. **Shortcode-Integration** - Chatbot in Gutenberg Editor einfügen
3. **Live-Chatbot** - So sieht der Chatbot auf deiner Website aus
4. **Mobile Ansicht** - Responsive Design auf mobilen Geräten
5. **Inline-Chat** - Eingebetteter Chat in Seiteninhalt
6. **Admin-Dashboard** - Übersicht und Konfiguration

== Changelog ==

= 1.0.0 =
* Initial release
* Basic shortcode functionality
* WordPress admin integration
* Theme customization options
* Responsive design
* Analytics integration
* Multi-bot support

== Upgrade Notice ==

= 1.0.0 =
Erste Veröffentlichung des HelferLain Chatbot Plugins.

== Support ==

Für Support und Fragen besuche:

* **Plugin Support**: [WordPress Plugin Forum](https://wordpress.org/support/plugin/helferlain-chatbot)
* **HelferLain Support**: [support@helferlain.app](mailto:support@helferlain.app)
* **Dokumentation**: [docs.helferlain.app](https://docs.helferlain.app)
* **GitHub**: [github.com/helferlain/wordpress-plugin](https://github.com/helferlain/wordpress-plugin)

== Credits ==

Entwickelt von [HelferLain](https://helferlain.app) - KI-Chatbots für jedermann.

Dieses Plugin nutzt:
* WordPress Plugin API
* HelferLain Chat API
* Vanilla JavaScript (keine zusätzlichen Abhängigkeiten)

== Privacy Policy ==

Dieses Plugin sendet Chat-Daten an HelferLain Server für die Chatbot-Funktionalität. Alle Daten werden gemäß unserer Datenschutzerklärung verarbeitet: https://helferlain.app/privacy

Keine Daten werden an andere Drittanbieter gesendet. Analytics-Daten sind optional und können deaktiviert werden.