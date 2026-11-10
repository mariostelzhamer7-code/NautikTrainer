# NautikTrainer

Persönliche, installierbare Lernapp für nautische Fragen.

## Version 1.1

- **Lernen:** zufällige Reihenfolge, unmittelbare Rückmeldung und kurze Erklärungen.
- **Prüfung:** einstellbare Auswahl von 10, 20, 30 oder 50 Fragen; Auswertung am Schluss.
- **Themenauswahl:** Lichter, Flaggen, Navigation, Wetter, Sicherheit, Regeln und Seemannschaft.
- **Fehler wiederholen**, **Merkliste**, **Bildfragen** und Fortschritt nach Themen.
- **Schriftgröße:** Normal oder Groß.
- Die persönlichen Einstellungen und der Lernfortschritt werden lokal auf dem Gerät gespeichert.
- Die App funktioniert offline, sobald sie einmal online geladen wurde und ihr Service Worker installiert ist.

## Dateien

- `index.html`, `styles.css`, `app.js`: Oberfläche und Lernabläufe.
- `data/questions.json`: 153 eingepflegte Fragen einschließlich Buchfragen, Zusatzfragen und vier neuen Signalflaggen-Bildfragen; 141 unterschiedliche Fragen sind aktiv, Wiederholungen werden beim Spielen herausgefiltert.
- `icons/`: NautikTrainer-Icon.
- `manifest.webmanifest` und `sw.js`: PWA-Installation und Offline-Cache.

Die App ist über GitHub Pages erreichbar. Der Startdialog der Einstellungen bleibt geschlossen, bis er geöffnet wird.
