/* eslint-disable @typescript-eslint/no-explicit-any */
const CARD_VERSION = "0.1.0";
console.info(`%c RAUMCONTROLLER-CARD %c v${CARD_VERSION}`, "color: white; background: #2563eb; font-weight: 700;", "color: #2563eb; background: transparent; font-weight: 700;");
class RaumcontrollerCard extends HTMLElement {
    setConfig(config) {
        if (!config) {
            throw new Error("Invalid configuration for raumcontroller-card.");
        }
        this._config = config;
        this.render();
    }
    set hass(hass) {
        this._hass = hass;
        this.render();
    }
    getCardSize() {
        return 5;
    }
    getEntity(entityId) {
        if (!entityId || !this._hass)
            return undefined;
        return this._hass.states[entityId];
    }
    render() {
        if (!this._config || !this._hass) {
            return;
        }
        const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        const title = this._config.title ?? "Raum";
        const co2 = this.getEntity(this._config.co2_entity);
        const temp = this.getEntity(this._config.temperature_entity);
        const co2Value = co2?.state;
        const tempValue = temp?.state;
        const co2Class = (() => {
            const val = co2Value ? Number(co2Value) : NaN;
            if (Number.isNaN(val))
                return "";
            if (val < 800)
                return "status-good";
            if (val < 1200)
                return "status-medium";
            return "status-bad";
        })();
        root.innerHTML = `
      <style>
        :host {
          --rc-bg: radial-gradient(circle at top left, #1f2933, #020617);
          --rc-border-radius: 22px;
          --rc-padding: 16px;
          --rc-gap: 12px;
          --rc-text-color: #e5e7eb;
          --rc-muted: #9ca3af;
          --rc-accent: #22c55e;
          --rc-danger: #ef4444;
          --rc-medium: #f59e0b;
          --rc-card-bg-soft: rgba(15, 23, 42, 0.75);
          --rc-pill-bg: rgba(15, 23, 42, 0.85);
          --rc-shadow: 0 18px 35px rgba(0, 0, 0, 0.55);
          display: block;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        }

        .rc-card {
          border-radius: var(--rc-border-radius);
          padding: var(--rc-padding);
          background: var(--rc-bg);
          color: var(--rc-text-color);
          box-shadow: var(--rc-shadow);
          display: flex;
          flex-direction: column;
          gap: var(--rc-gap);
        }

        .rc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rc-title {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .rc-subtitle {
          font-size: 0.75rem;
          color: var(--rc-muted);
        }

        .rc-pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--rc-pill-bg);
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rc-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
        }

        .rc-body {
          display: flex;
          flex-direction: column;
          gap: var(--rc-gap);
        }

        .rc-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        @media (max-width: 600px) {
          .rc-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .rc-info-strip {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 0.75rem;
        }

        .rc-info-pill {
          background: var(--rc-card-bg-soft);
          border-radius: 999px;
          padding: 4px 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rc-label {
          color: var(--rc-muted);
        }

        .rc-value {
          font-weight: 500;
        }

        .status-good .rc-value {
          color: var(--rc-accent);
        }

        .status-medium .rc-value {
          color: var(--rc-medium);
        }

        .status-bad .rc-value {
          color: var(--rc-danger);
        }

        .rc-grid {
          background: var(--rc-card-bg-soft);
          border-radius: 18px;
          padding: 8px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        @media (max-width: 600px) {
          .rc-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .rc-tile {
          border-radius: 14px;
          padding: 10px 8px;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.12s ease-out, background 0.12s ease-out, box-shadow 0.12s ease-out;
        }

        .rc-tile:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
        }

        .rc-tile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rc-tile-name {
          font-size: 0.8rem;
        }

        .rc-tile-icon {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .rc-tile-state {
          font-size: 0.75rem;
          color: var(--rc-muted);
        }

        .rc-tile-active {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(6, 182, 212, 0.16));
        }

        .rc-tile-active .rc-tile-state {
          color: #e5e7eb;
        }
      </style>
      <ha-card class="rc-card">
        <div class="rc-header">
          <div>
            <div class="rc-title">${title}</div>
            <div class="rc-subtitle">
              ${tempValue ? `${tempValue} °C` : "–"} ·
              ${co2Value ? `${co2Value} ppm CO₂` : "–"}
            </div>
          </div>
          <div class="rc-pill">
            <span class="rc-dot"></span>
            <span>Raumcontroller</span>
          </div>
        </div>

        <div class="rc-body">
          <div class="rc-info-strip">
            <div class="rc-info-pill ${co2Class}">
              <span class="rc-label">CO₂</span>
              <span class="rc-value">${co2Value ? `${co2Value} ppm` : "–"}</span>
            </div>
            <div class="rc-info-pill">
              <span class="rc-label">Temperatur</span>
              <span class="rc-value">${tempValue ? `${tempValue} °C` : "–"}</span>
            </div>
          </div>

          <div class="rc-grid">
            ${this.renderTile("Govee", this._config.govee_light, "💡")}
            ${this.renderTile("KNX", this._config.knx_light, "💡")}
            ${this.renderTile("Jalousien", this._config.cover_entity, "🪟")}
            ${this.renderTile("Klima", this._config.ac_entity, "❄️")}
            ${this.renderTile("Heizung", this._config.radiator_entity, "🔥")}
            ${this.renderTile("Musik", this._config.media_entity, "🎵")}
          </div>
        </div>
      </ha-card>
    `;
        this.attachTileHandlers();
    }
    renderTile(label, entityId, icon) {
        if (!entityId) {
            return `
        <div class="rc-tile rc-tile-disabled">
          <div class="rc-tile-header">
            <div class="rc-tile-name">${label}</div>
            <div class="rc-tile-icon">${icon}</div>
          </div>
          <div class="rc-tile-state">nicht konfiguriert</div>
        </div>
      `;
        }
        const entity = this.getEntity(entityId);
        const state = entity?.state ?? "unbekannt";
        const isActive = this.isEntityActive(entity);
        return `
      <div class="rc-tile ${isActive ? "rc-tile-active" : ""}" data-entity="${entityId}">
        <div class="rc-tile-header">
          <div class="rc-tile-name">${label}</div>
          <div class="rc-tile-icon">${icon}</div>
        </div>
        <div class="rc-tile-state">${state}</div>
      </div>
    `;
    }
    isEntityActive(entity) {
        if (!entity)
            return false;
        const onStates = ["on", "open", "playing", "cool", "heat", "auto"];
        return onStates.includes(entity.state);
    }
    attachTileHandlers() {
        const root = this.shadowRoot;
        if (!root || !this._hass)
            return;
        root.querySelectorAll(".rc-tile[data-entity]").forEach((tile) => {
            const entityId = tile.dataset.entity;
            if (!entityId)
                return;
            tile.onclick = () => {
                this.handleTileClick(entityId);
            };
        });
    }
    handleTileClick(entityId) {
        if (!this._hass)
            return;
        const [domain] = entityId.split(".");
        const entity = this.getEntity(entityId);
        if (!entity)
            return;
        switch (domain) {
            case "light":
                this._hass.callService("light", entity.state === "on" ? "turn_off" : "turn_on", {
                    entity_id: entityId
                });
                break;
            case "cover":
                this._hass.callService("cover", entity.state === "open" ? "close_cover" : "open_cover", {
                    entity_id: entityId
                });
                break;
            case "climate":
                this._hass.callService("climate", "set_hvac_mode", {
                    entity_id: entityId,
                    hvac_mode: entity.state === "off" ? "auto" : "off"
                });
                break;
            case "media_player":
                this._hass.callService("media_player", entity.state === "playing" ? "media_pause" : "media_play", {
                    entity_id: entityId
                });
                break;
            default:
                this._hass.callService(domain, "toggle", {
                    entity_id: entityId
                });
        }
    }
    static getConfigElement() {
        const el = document.createElement("div");
        el.innerHTML =
            "<p>Konfiguration der raumcontroller-card erfolgt über YAML-Optionen in der Karte.</p>";
        return el;
    }
    static getStubConfig() {
        return {
            type: "custom:raumcontroller-card",
            title: "Raum",
            co2_entity: "sensor.co2",
            temperature_entity: "sensor.temperature"
        };
    }
}
customElements.define("raumcontroller-card", RaumcontrollerCard);

export { RaumcontrollerCard };
//# sourceMappingURL=raumcontroller-card.js.map
