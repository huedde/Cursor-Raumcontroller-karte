/* eslint-disable @typescript-eslint/no-explicit-any */

interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

interface HomeAssistant {
  states: Record<string, HomeAssistantEntity>;
  callService(
    domain: string,
    service: string,
    data: Record<string, any>,
    target?: any
  ): void;
}

interface RaumcontrollerCardConfig {
  type: string;
  title?: string;
  co2_entity?: string;
  temperature_entity?: string;
  govee_light?: string;
  knx_light?: string;
  cover_entity?: string;
  ac_entity?: string;
  radiator_entity?: string;
  media_entity?: string;
}

const CARD_VERSION = "0.1.0";

console.info(
  `%c RAUMCONTROLLER-CARD %c v${CARD_VERSION}`,
  "color: white; background: #2563eb; font-weight: 700;",
  "color: #2563eb; background: transparent; font-weight: 700;"
);

export class RaumcontrollerCard extends HTMLElement {
  private _config?: RaumcontrollerCardConfig;
  private _hass?: HomeAssistant;

  setConfig(config: RaumcontrollerCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration for raumcontroller-card.");
    }
    this._config = config;
    this.render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.render();
  }

  getCardSize(): number {
    return 5;
  }

  private getEntity(entityId?: string): HomeAssistantEntity | undefined {
    if (!entityId || !this._hass) return undefined;
    return this._hass.states[entityId];
  }

  private render(): void {
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
      if (Number.isNaN(val)) return "";
      if (val < 800) return "status-good";
      if (val < 1200) return "status-medium";
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

  private renderTile(label: string, entityId: string | undefined, icon: string): string {
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

  private isEntityActive(entity?: HomeAssistantEntity): boolean {
    if (!entity) return false;
    const onStates = ["on", "open", "playing", "cool", "heat", "auto"];
    return onStates.includes(entity.state);
  }

  private attachTileHandlers(): void {
    const root = this.shadowRoot;
    if (!root || !this._hass) return;

    root.querySelectorAll<HTMLElement>(".rc-tile[data-entity]").forEach((tile) => {
      const entityId = tile.dataset.entity;
      if (!entityId) return;

      tile.onclick = () => {
        this.handleTileClick(entityId);
      };
    });
  }

  private handleTileClick(entityId: string): void {
    if (!this._hass) return;

    const [domain] = entityId.split(".");
    const entity = this.getEntity(entityId);
    if (!entity) return;

    switch (domain) {
      case "light":
        this._hass.callService("light", entity.state === "on" ? "turn_off" : "turn_on", {
          entity_id: entityId
        });
        break;
      case "cover":
        this._hass.callService(
          "cover",
          entity.state === "open" ? "close_cover" : "open_cover",
          {
            entity_id: entityId
          }
        );
        break;
      case "climate":
        this._hass.callService("climate", "set_hvac_mode", {
          entity_id: entityId,
          hvac_mode: entity.state === "off" ? "auto" : "off"
        });
        break;
      case "media_player":
        this._hass.callService(
          "media_player",
          entity.state === "playing" ? "media_pause" : "media_play",
          {
            entity_id: entityId
          }
        );
        break;
      default:
        this._hass.callService(domain, "toggle", {
          entity_id: entityId
        });
    }
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("raumcontroller-card-editor");
  }

  static getStubConfig(): RaumcontrollerCardConfig {
    return {
      type: "custom:raumcontroller-card",
      title: "Raum"
    };
  }
}

interface EditorField {
  key: keyof RaumcontrollerCardConfig;
  label: string;
  section: string;
  domains?: string[];
}

const EDITOR_FIELDS: EditorField[] = [
  { key: "title", label: "Raumname", section: "Allgemein" },
  { key: "co2_entity", label: "CO₂ Sensor", section: "Sensoren", domains: ["sensor"] },
  { key: "temperature_entity", label: "Temperatur Sensor", section: "Sensoren", domains: ["sensor"] },
  { key: "govee_light", label: "Govee Leuchte", section: "Licht", domains: ["light"] },
  { key: "knx_light", label: "KNX Leuchte", section: "Licht", domains: ["light"] },
  { key: "cover_entity", label: "Jalousien", section: "Beschattung", domains: ["cover"] },
  { key: "ac_entity", label: "Klimaanlage", section: "Klima", domains: ["climate"] },
  { key: "radiator_entity", label: "Heizkörper", section: "Klima", domains: ["climate"] },
  { key: "media_entity", label: "Musik / Sonos", section: "Medien", domains: ["media_player"] }
];

class RaumcontrollerCardEditor extends HTMLElement {
  private _config?: RaumcontrollerCardConfig;
  private _hass?: HomeAssistant;
  private _initialized = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._updatePickers();
  }

  setConfig(config: RaumcontrollerCardConfig): void {
    this._config = { ...config };
    this._buildEditor();
  }

  private _fireConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true
      })
    );
  }

  private _buildEditor(): void {
    if (!this._config) return;

    if (this._initialized) {
      this._syncValues();
      return;
    }

    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      .editor { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
      .section-title {
        font-size: 0.85rem; font-weight: 600;
        color: var(--primary-text-color, #e5e7eb);
        text-transform: uppercase; letter-spacing: 0.05em;
        margin-top: 8px; padding-bottom: 4px;
        border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.12));
      }
      .field { display: flex; flex-direction: column; gap: 4px; }
      .field input[type="text"] {
        width: 100%; box-sizing: border-box;
        padding: 8px 12px; border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
        background: var(--card-background-color, #1e293b);
        color: var(--primary-text-color, #e5e7eb);
        font-size: 0.9rem; outline: none;
      }
      .field input[type="text"]:focus { border-color: var(--primary-color, #2563eb); }
    `;
    root.appendChild(style);

    const editor = document.createElement("div");
    editor.className = "editor";

    let lastSection = "";

    for (const field of EDITOR_FIELDS) {
      if (field.section !== lastSection) {
        lastSection = field.section;
        const sectionEl = document.createElement("div");
        sectionEl.className = "section-title";
        sectionEl.textContent = field.section;
        editor.appendChild(sectionEl);
      }

      const fieldDiv = document.createElement("div");
      fieldDiv.className = "field";

      if (!field.domains) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `${field.label} eingeben…`;
        input.value = (this._config as any)[field.key] ?? "";
        input.addEventListener("input", () => {
          if (this._config) {
            (this._config as any)[field.key] = input.value;
            this._fireConfigChanged();
          }
        });
        fieldDiv.appendChild(input);
      } else {
        const picker = document.createElement("ha-entity-picker") as any;
        picker.label = field.label;
        picker.allowCustomEntity = true;
        picker.includeDomains = field.domains;
        picker.dataset.key = field.key;
        if (this._hass) picker.hass = this._hass;
        picker.value = (this._config as any)[field.key] ?? "";

        picker.addEventListener("value-changed", (ev: CustomEvent) => {
          if (this._config) {
            (this._config as any)[field.key] = ev.detail.value || "";
            this._fireConfigChanged();
          }
        });

        fieldDiv.appendChild(picker);
      }

      editor.appendChild(fieldDiv);
    }

    root.appendChild(editor);
    this._initialized = true;
  }

  private _updatePickers(): void {
    const root = this.shadowRoot;
    if (!root || !this._hass) return;
    root.querySelectorAll("ha-entity-picker").forEach((picker: any) => {
      picker.hass = this._hass;
    });
  }

  private _syncValues(): void {
    const root = this.shadowRoot;
    if (!root || !this._config) return;

    root.querySelectorAll<HTMLInputElement>("input[type='text']").forEach((input) => {
      const key = EDITOR_FIELDS.find(f => !f.domains)?.key;
      if (key) input.value = (this._config as any)[key] ?? "";
    });

    root.querySelectorAll("ha-entity-picker").forEach((picker: any) => {
      const key = picker.dataset.key;
      if (key) {
        picker.value = (this._config as any)[key] ?? "";
        if (this._hass) picker.hass = this._hass;
      }
    });
  }
}

customElements.define("raumcontroller-card-editor", RaumcontrollerCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    "raumcontroller-card": RaumcontrollerCard;
    "raumcontroller-card-editor": RaumcontrollerCardEditor;
  }
}

customElements.define("raumcontroller-card", RaumcontrollerCard);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "raumcontroller-card",
  name: "Raumcontroller Card",
  description: "Moderne Raumcontroller-Karte mit CO₂, Temperatur, Licht, Jalousien, Klima, Heizung und Medien.",
  preview: true
});

