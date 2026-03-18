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
          min-width: 520px;
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 800px) {
          .rc-card {
            min-width: 0;
          }

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
          transition: transform 0.15s ease-out, background 0.15s ease-out, box-shadow 0.15s ease-out;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
        }

        .rc-tile:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
        }

        .rc-tile:active {
          transform: scale(0.96);
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
            <div class="rc-info-pill" style="color:${this.getTempColor(tempValue)}">
              <span class="rc-label">Temperatur</span>
              <span class="rc-value" style="color:${this.getTempColor(tempValue)}">${tempValue ? `${tempValue} °C` : "–"}</span>
            </div>
          </div>

          <div class="rc-grid">
            ${this.renderTile("Govee", this._config.govee_light, "💡")}
            ${this.renderTile("KNX", this._config.knx_light, "💡")}
            ${this.renderTile("Licht 1", this._config.extra_light_1, "💡")}
            ${this.renderTile("Licht 2", this._config.extra_light_2, "💡")}
            ${this.renderTile("Licht 3", this._config.extra_light_3, "💡")}
            ${this.renderTile("Jalousien", this._config.cover_entity, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="9" width="18" height="4" rx="1"/><rect x="3" y="15" width="18" height="4" rx="1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`)}
            ${this.renderTile("Jalousie 1", this._config.extra_cover_1, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="3" rx="1"/><rect x="3" y="8" width="18" height="3" rx="1"/><rect x="3" y="13" width="18" height="3" rx="1"/><line x1="7" y1="18" x2="7" y2="21"/><line x1="17" y1="18" x2="17" y2="21"/></svg>`)}
            ${this.renderTile("Jalousie 2", this._config.extra_cover_2, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="3" rx="1"/><rect x="3" y="8" width="18" height="3" rx="1"/><rect x="3" y="13" width="18" height="3" rx="1"/><line x1="7" y1="18" x2="7" y2="21"/><line x1="17" y1="18" x2="17" y2="21"/></svg>`)}
            ${this.renderTile("Jalousie 3", this._config.extra_cover_3, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="3" rx="1"/><rect x="3" y="8" width="18" height="3" rx="1"/><rect x="3" y="13" width="18" height="3" rx="1"/><line x1="7" y1="18" x2="7" y2="21"/><line x1="17" y1="18" x2="17" y2="21"/></svg>`)}
            ${this.renderTile("Klima", this._config.ac_entity, "❄️")}
            ${this.renderHeatingTile()}
            ${this.renderTile("Abwesend", this._config.away_script, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-5.5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2V21H4a1 1 0 0 1-1-1z"/><circle cx="6.5" cy="9" r="1.4"/><path d="M5.1 14.5c.3-.8 1-1.5 1.9-1.5s1.6.7 1.9 1.5"/></svg>`)}
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
    getTempColor(tempValue) {
        if (!tempValue)
            return "#9ca3af";
        const t = Number(tempValue);
        if (Number.isNaN(t))
            return "#9ca3af";
        if (t <= 16)
            return "#3b82f6";
        if (t <= 19)
            return "#38bdf8";
        if (t <= 22)
            return "#22c55e";
        if (t <= 25)
            return "#f59e0b";
        if (t <= 28)
            return "#f97316";
        return "#ef4444";
    }
    getHeatingColor() {
        if (!this._config?.radiator_entity || !this._hass)
            return "#9ca3af";
        const entity = this.getEntity(this._config.radiator_entity);
        if (!entity)
            return "#9ca3af";
        const currentTemp = Number(entity.attributes?.current_temperature);
        const targetTemp = Number(entity.attributes?.temperature);
        if (!Number.isNaN(targetTemp)) {
            if (targetTemp <= 18)
                return "#3b82f6";
            if (targetTemp <= 20)
                return "#38bdf8";
            if (targetTemp <= 22)
                return "#22c55e";
            if (targetTemp <= 24)
                return "#f59e0b";
            return "#ef4444";
        }
        if (!Number.isNaN(currentTemp)) {
            if (currentTemp <= 18)
                return "#3b82f6";
            if (currentTemp <= 20)
                return "#38bdf8";
            if (currentTemp <= 22)
                return "#22c55e";
            if (currentTemp <= 24)
                return "#f59e0b";
            return "#ef4444";
        }
        return entity.state === "off" ? "#3b82f6" : "#f59e0b";
    }
    renderHeatingTile() {
        const entityId = this._config?.radiator_entity;
        const heatingColor = this.getHeatingColor();
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${heatingColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><line x1="12" y1="16" x2="12" y2="12"/></svg>`;
        if (!entityId) {
            return `
        <div class="rc-tile rc-tile-disabled">
          <div class="rc-tile-header">
            <div class="rc-tile-name">Heizung</div>
            <div class="rc-tile-icon">${svgIcon}</div>
          </div>
          <div class="rc-tile-state">nicht konfiguriert</div>
        </div>
      `;
        }
        const entity = this.getEntity(entityId);
        const state = entity?.state ?? "unbekannt";
        const isActive = this.isEntityActive(entity);
        const targetTemp = entity?.attributes?.temperature;
        const stateText = targetTemp ? `${state} · ${targetTemp} °C` : state;
        return `
      <div class="rc-tile ${isActive ? "rc-tile-active" : ""}" data-entity="${entityId}">
        <div class="rc-tile-header">
          <div class="rc-tile-name">Heizung</div>
          <div class="rc-tile-icon">${svgIcon}</div>
        </div>
        <div class="rc-tile-state" style="color:${heatingColor}">${stateText}</div>
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
        const HOLD_MS = 400;
        root.querySelectorAll(".rc-tile[data-entity]").forEach((tile) => {
            const entityId = tile.dataset.entity;
            if (!entityId)
                return;
            let holdTimer = null;
            let didHold = false;
            const startHold = (e) => {
                didHold = false;
                holdTimer = setTimeout(() => {
                    didHold = true;
                    this.openMoreInfo(entityId);
                    tile.style.transform = "scale(0.95)";
                    setTimeout(() => { tile.style.transform = ""; }, 150);
                }, HOLD_MS);
            };
            const endHold = (e) => {
                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }
                if (!didHold) {
                    this.handleTileClick(entityId);
                }
                didHold = false;
            };
            const cancelHold = () => {
                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }
            };
            tile.addEventListener("pointerdown", startHold);
            tile.addEventListener("pointerup", endHold);
            tile.addEventListener("pointercancel", cancelHold);
            tile.addEventListener("pointerleave", cancelHold);
            tile.addEventListener("contextmenu", (e) => e.preventDefault());
            tile.onclick = (e) => { e.preventDefault(); };
        });
    }
    openMoreInfo(entityId) {
        const event = new Event("hass-more-info", {
            bubbles: true,
            composed: true
        });
        event.detail = { entityId };
        this.dispatchEvent(event);
    }
    handleTileClick(entityId) {
        if (!this._hass)
            return;
        const [domain] = entityId.split(".");
        const entity = this.getEntity(entityId);
        if (!entity && domain !== "script")
            return;
        switch (domain) {
            case "light":
                this._hass.callService("light", entity.state === "on" ? "turn_off" : "turn_on", {
                    entity_id: entityId
                });
                break;
            case "cover":
                this.openMoreInfo(entityId);
                break;
            case "climate":
                this.openMoreInfo(entityId);
                break;
            case "media_player":
                this.openMoreInfo(entityId);
                break;
            case "script":
                this._hass.callService("script", "turn_on", {
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
        return document.createElement("raumcontroller-card-editor");
    }
    static getStubConfig() {
        return {
            type: "custom:raumcontroller-card",
            title: "Raum"
        };
    }
}
const FORM_SCHEMA = [
    {
        type: "string",
        name: "title",
        required: true,
        selector: { text: {} }
    },
    {
        type: "string",
        name: "co2_entity",
        selector: { entity: { domain: "sensor" } }
    },
    {
        type: "string",
        name: "temperature_entity",
        selector: { entity: { domain: "sensor" } }
    },
    {
        type: "string",
        name: "govee_light",
        selector: { entity: { domain: "light" } }
    },
    {
        type: "string",
        name: "knx_light",
        selector: { entity: { domain: "light" } }
    },
    {
        type: "string",
        name: "extra_light_1",
        selector: { entity: { domain: "light" } }
    },
    {
        type: "string",
        name: "extra_light_2",
        selector: { entity: { domain: "light" } }
    },
    {
        type: "string",
        name: "extra_light_3",
        selector: { entity: { domain: "light" } }
    },
    {
        type: "string",
        name: "cover_entity",
        selector: { entity: { domain: "cover" } }
    },
    {
        type: "string",
        name: "extra_cover_1",
        selector: { entity: { domain: "cover" } }
    },
    {
        type: "string",
        name: "extra_cover_2",
        selector: { entity: { domain: "cover" } }
    },
    {
        type: "string",
        name: "extra_cover_3",
        selector: { entity: { domain: "cover" } }
    },
    {
        type: "string",
        name: "ac_entity",
        selector: { entity: { domain: "climate" } }
    },
    {
        type: "string",
        name: "radiator_entity",
        selector: { entity: { domain: "climate" } }
    },
    {
        type: "string",
        name: "media_entity",
        selector: { entity: { domain: "media_player" } }
    },
    {
        type: "string",
        name: "away_script",
        selector: { entity: { domain: "script" } }
    }
];
const LABELS = {
    title: "Raumname",
    co2_entity: "CO₂ Sensor",
    temperature_entity: "Temperatur Sensor",
    govee_light: "Govee Leuchte",
    knx_light: "KNX Leuchte",
    extra_light_1: "Zusätzliches Licht 1",
    extra_light_2: "Zusätzliches Licht 2",
    extra_light_3: "Zusätzliches Licht 3",
    cover_entity: "Jalousien",
    extra_cover_1: "Zusätzliche Jalousie 1",
    extra_cover_2: "Zusätzliche Jalousie 2",
    extra_cover_3: "Zusätzliche Jalousie 3",
    ac_entity: "Klimaanlage",
    radiator_entity: "Heizkörper",
    media_entity: "Musik / Sonos",
    away_script: "Abwesend-Script"
};
class RaumcontrollerCardEditor extends HTMLElement {
    constructor() {
        super(...arguments);
        this._form = null;
    }
    set hass(hass) {
        this._hass = hass;
        if (this._form) {
            this._form.hass = hass;
        }
    }
    setConfig(config) {
        this._config = { ...config };
        this._render();
    }
    _render() {
        if (!this._config)
            return;
        if (!this._form) {
            this._form = document.createElement("ha-form");
            this._form.schema = FORM_SCHEMA;
            this._form.computeLabel = (schema) => LABELS[schema.name] || schema.name;
            this._form.addEventListener("value-changed", (ev) => {
                if (!this._config || !ev.detail)
                    return;
                this._config = { ...this._config, ...ev.detail.value };
                this._form.data = this._config;
                this.dispatchEvent(new CustomEvent("config-changed", {
                    detail: { config: { ...this._config } },
                    bubbles: true,
                    composed: true
                }));
            });
            this.appendChild(this._form);
        }
        if (this._hass)
            this._form.hass = this._hass;
        this._form.data = this._config;
    }
}
customElements.define("raumcontroller-card-editor", RaumcontrollerCardEditor);
customElements.define("raumcontroller-card", RaumcontrollerCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "raumcontroller-card",
    name: "Raumcontroller Card",
    description: "Moderne Raumcontroller-Karte mit CO₂, Temperatur, Licht, Jalousien, Klima, Heizung und Medien.",
    preview: true
});

export { RaumcontrollerCard };
//# sourceMappingURL=raumcontroller-card.js.map
