# iFSR-Manual

Das offizielle Studien Manual des Fachschaftsrats Informatik https://manual.ifsr.de/

## Neue Artikel hinzufügen

Um neue Artikel in das Manual aufzunehmen, befolge diese Schritte:

1. Erstelle eine neue Markdown-Datei im Ordner `docs/`, z. B. `artikel.md`.

2. Füge ein passendes Kapitel zur Sidebar hinzu (zu finden im `/index.html` file)

3. Führe das `deploy.sh` Skript aus, um die Markdown Dateien in html Files zu konvertieren.

4. Pushe deine Änderungen, um die Seite zu aktualisieren. Der Artikel wird dann automatisch indiziert.

## Voraussetzungen

Um Markdown-Dateien in HTML zu konvertieren, musst du [Pandoc](https://pandoc.org/) auf deinem System installiert haben.

Du kannst es mit den folgenden Befehlen installieren:

- **Linux**: `sudo apt install pandoc`
- **macOS**: `brew install pandoc`
- **Windows**: Lade den Installer von [Pandocs Website](https://pandoc.org/installing.html) herunter.

### Kontakt

jannik.menzel@ifsr.de

## Lizenz

Dieses Projekt ist unter der GNU General Public License v3.0 (GPLv3) lizenziert – weitere Details findest du in der Datei `LICENSE`.
