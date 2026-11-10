# NautikTrainer

Persönliche, installierbare Lernapp für nautische Fragen. Der Stand 1.0 enthält zwei Modi:

- **Lernen:** alle Fragen in neuer zufälliger Reihenfolge, sofortige Rückmeldung nach jeder Antwort.
- **Prüfung:** 30 zufällig gewählte Fragen, keine sofortige Richtig/Falsch-Anzeige, Prozent-Auswertung am Schluss.

Antworten werden in jeder Runde neu gemischt. Die App funktioniert offline, sobald sie einmal online geladen wurde und ihr Service Worker installiert ist.

## Dateien

- `index.html`, `styles.css`, `app.js`: Oberfläche und Spielablauf.
- `data/questions.json`: 149 eingepflegte Fragen (89 Buchfragen und 60 Zusatzfragen). Exakte Wiederholungen und klar doppelte Zusatzfragen werden beim Spielen herausgefiltert; aktiv sind 137 unterschiedliche Fragen; genaue und klar erkennbare Wiederholungen bleiben im Quellenbestand, werden aber nicht erneut abgefragt.
- `icons/`: NautikTrainer-Icon in passenden Größen.
- `manifest.webmanifest` und `sw.js`: PWA-Installation und Offline-Cache.

GitHub Pages ist noch nicht aktiviert. Eine Veröffentlichung würde eine öffentlich erreichbare Website erzeugen, auch wenn dieses Repository privat bleibt.
