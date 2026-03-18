## Raumcontroller Karte für Home Assistant

Dieses Repository enthält eine **moderne, kompakte Raumcontroller‑Karte** für Home Assistant (Lovelace).  
Die Karte bündelt alle wichtigen Funktionen eines Raums:

- CO₂‑Wert
- Temperatur
- Govee‑Leuchte
- KNX‑Leuchte
- Jalousien
- Klimaanlage
- Heizkörper
- Medienwiedergabe (z.B. Sonos)

Die Karte wird als **Custom Lovelace Card** (`raumcontroller-card`) bereitgestellt.

### Ordnerstruktur

```text
.
├─ src/
│  └─ raumcontroller-card.ts    # Quellcode der Custom Card (TypeScript)
├─ dist/
│  └─ raumcontroller-card.js    # Gebautes Bundle für Home Assistant
├─ rollup.config.mjs            # Build-Konfiguration
├─ package.json
├─ tsconfig.json
└─ README.md
```

### Installation in Home Assistant

1. Das gebaute File `dist/raumcontroller-card.js` nach `config/www/raumcontroller-card/` kopieren.
2. In `configuration.yaml` (oder über Einstellungen → Dashboards → Ressourcen) hinzufügen:

```yaml
lovelace:
  resources:
    - url: /local/raumcontroller-card/raumcontroller-card.js
      type: module
```

3. Home Assistant neu laden / Browser Cache leeren.
4. Im Dashboard (YAML) die Karte verwenden:

```yaml
type: custom:raumcontroller-card
title: Wohnzimmer
co2_entity: sensor.wohnzimmer_co2
temperature_entity: sensor.wohnzimmer_temperature
govee_light: light.govee_wohnzimmer
knx_light: light.wohnzimmer_knx
cover_entity: cover.wohnzimmer_jalousie
ac_entity: climate.wohnzimmer_ac
radiator_entity: climate.wohnzimmer_heizkoerper
media_entity: media_player.wohnzimmer_sonos
```

Weitere Details zur Konfiguration findest du in den Kommentaren im Quellcode.

