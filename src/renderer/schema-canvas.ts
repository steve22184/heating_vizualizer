import { css, html, LitElement, nothing, svg, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HassEntities,
  HomeAssistantFormatters,
  HomeAssistantInternationalization,
} from "../types/home-assistant.js";
import type { Connection, HeatingSchema, PipeStyle, SchemaNode } from "../models/schema.js";
import { connectionId, parsePortRef, pinnedSize } from "../models/schema.js";
import { getNodeDefinition } from "../models/device-registry.js";
import { createTranslator } from "../i18n/index.js";
import type { Translator } from "../i18n/translations.js";
import {
  buildPipePath,
  draggableSegments,
  getAbsolutePort,
  getNodeBounds,
  moveSegment,
  normalizeRotation,
  pathFromPoints,
  routePoints,
  routeSkeleton,
  snapToGrid,
  type AbsolutePort,
  type Point,
  type Rect,
  type RoutePoint,
} from "../utils/geometry.js";
import {
  formatOverlayName,
  formatOverlayValue,
  resolveNodeVisualState,
  resolveOverlayStyle,
} from "../utils/entity.js";
import { HA_CONTEXT, HassContextConsumer } from "../utils/context.js";
import { actionTarget, canTap, DETAIL_ACTION, hasAction, type ActionHandlerConfig, type ActionKind } from "../utils/actions.js";
import { renderDeviceByType } from "./devices/heat-pump.js";
import { badgeAddons, layoutBadges, renderAddonBadges } from "./devices/addon-badges.js";
import type { ResolvedAddon } from "./devices/common.js";
import { activeFromAddons, withNumericActivity } from "./devices/common.js";
import { heatPumpState } from "./devices/heat-pump-state.js";
import { detailStyles, heatPumpDetail, renderHeatPumpDetail } from "./devices/heat-pump-detail.js";
import { ADDON_TYPES } from "../models/addons.js";
import {
  dhwValveBranch,
  flowingConnections,
  pipeMedia,
  type FlowNodeState,
  type Medium,
} from "../models/hydraulics.js";
import type { NodeVisualState } from "../utils/entity.js";

const MEDIUM_COLORS: Record<Medium, string> = {
  supply: "#ef5350",
  return: "#42a5f5",
  hot_water: "#ffa726",
  cold_water: "#4dd0e1",
};

// Three dash layers share one period and end at the same point: a bright head with a fading tail.
const FLOW_LAYERS = [
  { dash: "16 24", opacity: 0.15 },
  { dash: "0 6 10 24", opacity: 0.35 },
  { dash: "0 11 5 24", opacity: 0.85 },
];

interface ResolvedNode {
  visual: NodeVisualState;
  addons: ResolvedAddon[];
}

interface PipeLayout {
  connection: Connection;
  id: string;
  from: AbsolutePort;
  to: AbsolutePort;
  /** Bends after simplification; missing for curved pipes. */
  points?: Point[];
  /** Editable form including both stubs. */
  skeleton?: Point[];
}

interface VerticalSegment {
  id: string;
  x: number;
  y1: number;
  y2: number;
}

interface SegmentDrag {
  id: string;
  index: number;
  horizontal: boolean;
  start: Point;
  skeleton: Point[];
}

function verticalSegments(pipes: PipeLayout[]): VerticalSegment[] {
  return pipes.flatMap((pipe) =>
    (pipe.points ?? []).slice(1).flatMap((q, i) => {
      const p = (pipe.points ?? [])[i];
      return p.x === q.x && p.y !== q.y
        ? [{ id: pipe.id, x: p.x, y1: Math.min(p.y, q.y), y2: Math.max(p.y, q.y) }]
        : [];
    })
  );
}

function flowState(node: ResolvedNode | undefined): FlowNodeState {
  if (!node) return { active: false };
  const ofType = (type: string): ResolvedAddon[] => node.addons.filter((a) => a.config.type === type);
  return {
    active: node.visual.active,
    valveBranch: node.visual.valveBranch,
    pumpActive: ofType("pump").some((a) => a.config.entity_id && a.state.active),
    pumpBound: ofType("pump").some((a) => a.config.entity_id),
    // Loops without an actuator entity are always open.
    loops: ofType("loop").map((a) => !a.config.entity_id || a.state.active),
  };
}
import { nodeDescription } from "./a11y.js";

const BADGE_OFFSET = 6;
const BADGE_MIN_WIDTH = 120;

// Same timings as the Home Assistant action handler.
const HOLD_MS = 500;
const DOUBLE_TAP_MS = 250;
const MOVE_TOLERANCE = 10;

interface Press {
  key: string;
  config: ActionHandlerConfig;
  /** Device pressed, for actions the card handles itself. */
  nodeId?: string;
  x: number;
  y: number;
  timer?: number;
  held: boolean;
}

const GRID_SIZE = 10;
const NUDGE_STEP = GRID_SIZE;
const NUDGE_STEP_LARGE = GRID_SIZE * 5;

const ARROW_KEYS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

@customElement("heating-schema-canvas")
export class HeatingSchemaCanvas extends LitElement {
  @property({ attribute: false }) public schema: HeatingSchema = {
    nodes: [],
    connections: [],
    overlays: [],
  };
  @property({ type: Boolean }) public editable = false;
  /** Dragging devices and connecting ports; off by default so scrolling on touch screens cannot move anything. */
  @property({ type: Boolean }) public drawing = false;
  @property({ attribute: false }) public pipeStyle: PipeStyle = "orthogonal";
  /** Color pipes by what flows in them (heating supply/return, hot/cold water). */
  @property({ attribute: false }) public pipeColors = true;
  /** Animate water in pipes that currently flow. */
  @property({ attribute: false }) public flowAnimation = true;
  @property({ attribute: false }) public selectedNodeId?: string;
  @property({ attribute: false }) public selectedEdgeId?: string;
  @property({ attribute: false }) public selectedPort?: { nodeId: string; portId: string };

  static styles = [
    detailStyles,
    css`
    :host {
      display: block;
      width: 100%;
      overflow: auto;
    }
    svg.schema {
      width: 100%;
      min-height: 280px;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border-radius: var(--ha-card-border-radius, 12px);
      user-select: none;
    }
    .pipe {
      fill: none;
      stroke: #78909c;
      stroke-width: 4;
      stroke-linecap: round;
    }
    .pipe.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 6;
    }
    .pipe-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 16;
      pointer-events: stroke;
      cursor: pointer;
    }
    .segment-handle {
      fill: var(--primary-color, #03a9f4);
      stroke: var(--card-background-color, #1c1c1c);
      stroke-width: 2;
    }
    .segment-handle.horizontal {
      cursor: row-resize;
    }
    .segment-handle.vertical {
      cursor: col-resize;
    }
    .flow {
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      pointer-events: none;
      animation: flow 1.2s linear infinite;
    }
    @keyframes flow {
      to {
        stroke-dashoffset: -40;
      }
    }
    .grid-dot {
      fill: var(--divider-color, #555);
    }
    .spinning {
      transform-box: fill-box;
      transform-origin: center;
      animation: spin 1.6s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinning,
      .flow {
        animation: none;
      }
    }
    .device-label {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-xs, 11px);
      pointer-events: none;
    }
    .device-value {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-s, 12px);
      font-weight: var(--ha-font-weight-medium, 500);
      pointer-events: none;
    }
    .node {
      cursor: default;
    }
    :host([editable]) .node {
      cursor: pointer;
    }
    :host([drawing]) .node {
      cursor: grab;
    }
    :host([drawing]) .node.dragging {
      cursor: grabbing;
    }
    :host([drawing]) svg {
      touch-action: none;
    }
    svg:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .actionable:focus {
      outline: none;
    }
    .actionable:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 4px;
    }
    .overlay-group {
      pointer-events: none;
    }
    :host(:not([editable])) .actionable {
      cursor: pointer;
    }
    :host(:not([editable])) .overlay-group.actionable {
      pointer-events: auto;
    }
    .addon-value {
      font-size: var(--ha-font-size-xs, 11px);
    }
    .heating-rod.active {
      filter: drop-shadow(0 0 3px #ff7043);
    }
    .overlay-bg {
      fill: var(--card-background-color, #1c1c1c);
      stroke: var(--divider-color, #555);
      stroke-width: 1;
      opacity: 0.92;
    }
    .overlay-text {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-s, 12px);
    }
    .port-highlight {
      stroke: var(--primary-color, #03a9f4) !important;
      stroke-width: 3 !important;
    }
    .stage {
      position: relative;
      container-type: inline-size;
    }
    .pinned {
      position: absolute;
      width: max(200px, var(--pin-size, 40%));
      max-width: 100%;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      cursor: pointer;
    }
    /* On narrow cards a corner window would be too small to read, so it goes below the schema. */
    @container (max-width: 560px) {
      .pinned {
        position: static;
        width: auto;
        margin-top: 8px;
        box-shadow: none;
      }
    }
    .pinned:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .pinned.top_left {
      top: 8px;
      left: 8px;
    }
    .pinned.top_right {
      top: 8px;
      right: 8px;
    }
    .pinned.bottom_left {
      bottom: 8px;
      left: 8px;
    }
    .pinned.bottom_right {
      bottom: 8px;
      right: 8px;
    }
    dialog.detail {
      width: min(96vw, 1040px);
      max-height: 96vh;
      padding: 8px 12px 12px;
      color: var(--primary-text-color, #e0e0e0);
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border: none;
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
    }
    dialog.detail::backdrop {
      background: rgba(0, 0, 0, 0.6);
    }
    .detail-head {
      display: flex;
      justify-content: flex-end;
    }
    .detail-head button {
      width: 36px;
      height: 36px;
      font-size: 22px;
      color: inherit;
      background: none;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
    .detail-head button:hover {
      background: rgba(127, 127, 127, 0.2);
    }
  `,
  ];

  /** Heat pump whose detail is open in the dialog. */
  @state() private _detailNodeId?: string;

  private _dragNodeId?: string;
  private _segmentDrag?: SegmentDrag;
  private _routePreview?: { id: string; route: RoutePoint[] };
  private _press?: Press;
  private _pendingTap?: { key: string; timer: number };
  private _dragOffset?: Point;
  // Frozen while dragging so the coordinate system does not shift under the pointer.
  private _dragBounds?: Rect;

  private _states = new HassContextConsumer<HassEntities>(this, HA_CONTEXT.states);
  private _formatters = new HassContextConsumer<HomeAssistantFormatters>(
    this,
    HA_CONTEXT.formatters
  );
  private _i18n = new HassContextConsumer<HomeAssistantInternationalization>(
    this,
    HA_CONTEXT.internationalization
  );

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("editable")) {
      this.toggleAttribute("editable", this.editable);
    }
    if (changed.has("drawing") || changed.has("editable")) {
      this.toggleAttribute("drawing", this.editable && this.drawing);
    }
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog.detail");
    if (dialog && !dialog.open) dialog.showModal();
  }

  protected render(): TemplateResult {
    const t = this._translator();
    const { nodes, connections, overlays } = this.schema;
    const bounds = this._dragBounds ?? this._computeBounds(nodes);
    const resolved = new Map(nodes.map((n) => [n.id, this._resolveNode(n)]));
    this._inferOperations(resolved);
    const media = this.pipeColors ? pipeMedia(this.schema) : new Map<string, Medium>();
    const flowing = this.flowAnimation
      ? flowingConnections(this.schema, (n) => flowState(resolved.get(n.id)))
      : new Set<string>();
    const pipes = connections
      .map((c) => this._layoutPipe(c))
      .filter((p): p is PipeLayout => p !== undefined);
    const verticals = verticalSegments(pipes);

    return html`
      <div class="stage">
      <svg
        class="schema"
        viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}"
        role="group"
        aria-label="${t.t("a11y.schema")}"
        tabindex="${this.editable ? "0" : nothing}"
        @keydown="${this._onKeyDown}"
        @pointerdown="${this._onCanvasPointerDown}"
        @pointermove="${this._onCanvasPointerMove}"
        @pointerup="${this._onCanvasPointerUp}"
        @pointerleave="${this._onCanvasPointerLeave}"
        @pointercancel="${this._onCanvasPointerLeave}"
      >
        ${this.editable && this.drawing
          ? svg`
            <defs>
              <pattern id="grid" width="${GRID_SIZE * 2}" height="${GRID_SIZE * 2}" patternUnits="userSpaceOnUse">
                <circle class="grid-dot" cx="0" cy="0" r="1" />
              </pattern>
            </defs>
            <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="url(#grid)" aria-hidden="true" />
          `
          : nothing}
        ${pipes.map((pipe) => this._renderConnection(pipe, media, flowing, verticals))}
        ${nodes.map((node) => this._renderNode(node, t, resolved.get(node.id)))}
        ${overlays.map((overlay) => this._renderOverlay(overlay))}
      </svg>
      ${this.editable ? nothing : this._renderPinnedDetails(t, resolved)}
      ${this._renderDetailDialog(t, resolved)}
      </div>
    `;
  }

  private _detailOf(node: SchemaNode, t: Translator, resolved: ResolvedNode | undefined): ReturnType<typeof heatPumpDetail> {
    const name = node.name || t.t("devices.heat_pump.name");
    const { visual, addons } = resolved ?? this._resolveNode(node);
    return heatPumpDetail(name, node.variant, visual, addons, t);
  }

  private _renderPinnedDetails(t: Translator, resolved: Map<string, ResolvedNode>): TemplateResult[] {
    return this.schema.nodes
      .filter((node) => node.type === "heat_pump" && node.detail_pin)
      .map((node) => {
        const detail = this._detailOf(node, t, resolved.get(node.id));
        const status = detail.operation ? `, ${t.t(`operation.${detail.operation}`)}` : "";
        return html`
          <div
            class="pinned ${node.detail_pin}"
            style="--pin-size: ${pinnedSize(node)}%"
            role="button"
            tabindex="0"
            aria-label="${t.t("detail.open", detail.name)}${status}"
            @click="${() => this._openDetail(node.id)}"
            @keydown="${(ev: KeyboardEvent) => {
              if (ev.key !== "Enter" && ev.key !== " ") return;
              ev.preventDefault();
              this._openDetail(node.id);
            }}"
          >
            ${renderHeatPumpDetail(detail, t, true)}
          </div>
        `;
      });
  }

  private _renderDetailDialog(t: Translator, resolved: Map<string, ResolvedNode>): TemplateResult | typeof nothing {
    const node = this.schema.nodes.find((n) => n.id === this._detailNodeId && n.type === "heat_pump");
    if (!node) return nothing;
    const detail = this._detailOf(node, t, resolved.get(node.id));
    return html`
      <dialog
        class="detail"
        aria-label="${detail.name}"
        @close="${() => {
          this._detailNodeId = undefined;
        }}"
        @click="${(ev: MouseEvent) => {
          // A click on the backdrop lands on the dialog element itself.
          if (ev.target === ev.currentTarget) (ev.currentTarget as HTMLDialogElement).close();
        }}"
        @keydown="${(ev: KeyboardEvent) => {
          if (ev.key === "Escape") (ev.currentTarget as HTMLDialogElement).close();
        }}"
      >
        <div class="detail-head">
          <button
            type="button"
            aria-label="${t.t("detail.close")}"
            @click="${(ev: Event) => ((ev.target as HTMLElement).closest("dialog") as HTMLDialogElement).close()}"
          >×</button>
        </div>
        ${renderHeatPumpDetail(detail, t)}
      </dialog>
    `;
  }

  private _openDetail(nodeId: string): void {
    this._detailNodeId = nodeId;
  }

  private _translator(): Translator {
    return createTranslator(this._i18n.value?.language);
  }

  private _computeBounds(nodes: SchemaNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (!nodes.length) {
      return { x: 0, y: 0, width: 800, height: 400 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const def = getNodeDefinition(node);
      if (!def) continue;
      const rect = getNodeBounds(node, def);
      const badges = layoutBadges(badgeAddons(node.type, this._resolveAddons(node)), this._badgeWidth(rect));
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y - 28);
      maxX = Math.max(maxX, rect.x + Math.max(rect.width, badges.height ? this._badgeWidth(rect) : 0));
      maxY = Math.max(maxY, rect.y + rect.height + 10 + (badges.height ? badges.height + BADGE_OFFSET : 0));
    }
    for (const [x, y] of this.schema.connections.flatMap((c) => c.route ?? [])) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const pad = 40;
    return {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }

  private _layoutPipe(connection: Connection): PipeLayout | undefined {
    const fromRef = parsePortRef(connection.from);
    const toRef = parsePortRef(connection.to);
    const fromNode = this.schema.nodes.find((n) => n.id === fromRef?.nodeId);
    const toNode = this.schema.nodes.find((n) => n.id === toRef?.nodeId);
    if (!fromRef || !toRef || !fromNode || !toNode) return undefined;

    const from = getAbsolutePort(fromNode, fromRef.portId);
    const to = getAbsolutePort(toNode, toRef.portId);
    if (!from || !to) return undefined;

    const id = connectionId(connection);
    const route = this._routePreview?.id === id ? this._routePreview.route : connection.route;
    // A drawn route always wins over the curved style, which has no bends to edit.
    if (this.pipeStyle === "curved" && !route?.length) return { connection, id, from, to };
    return { connection, id, from, to, points: routePoints(from, to, route), skeleton: routeSkeleton(from, to, route) };
  }

  private _renderConnection(
    pipe: PipeLayout,
    media: Map<string, Medium>,
    flowing: Set<string>,
    verticals: VerticalSegment[]
  ): TemplateResult {
    const { id, from, to, points } = pipe;
    const hopsAt = (p: Point, q: Point): number[] =>
      verticals
        .filter(
          (v) =>
            v.id !== id &&
            v.x > Math.min(p.x, q.x) &&
            v.x < Math.max(p.x, q.x) &&
            p.y > v.y1 + 1 &&
            p.y < v.y2 - 1
        )
        .map((v) => v.x);
    const d = points ? pathFromPoints(points, hopsAt) : buildPipePath(from, to);
    const selected = this.selectedEdgeId === id;
    const medium = media.get(id);
    const skeleton = this.editable && this.drawing && selected ? pipe.skeleton : undefined;
    const handles = skeleton ? draggableSegments(skeleton) : [];
    return svg`
      <path class="pipe ${selected ? "selected" : ""}" d="${d}" aria-hidden="true"
        style="${medium && !selected ? `stroke: ${MEDIUM_COLORS[medium]}` : ""}" />
      ${flowing.has(id)
        ? svg`<g aria-hidden="true">
            ${FLOW_LAYERS.map((layer) => svg`<path class="flow" d="${d}" stroke-dasharray="${layer.dash}" stroke-opacity="${layer.opacity}" />`)}
          </g>`
        : nothing}
      ${this.editable ? svg`<path class="pipe-hit" data-edge-id="${id}" d="${d}" />` : nothing}
      ${handles.map((index) => {
        const [p, q] = [(skeleton ?? [])[index], (skeleton ?? [])[index + 1]];
        const horizontal = p.y === q.y;
        return svg`<rect class="segment-handle ${horizontal ? "horizontal" : "vertical"}"
          data-edge="${id}" data-segment="${index}"
          x="${(p.x + q.x) / 2 - 5}" y="${(p.y + q.y) / 2 - 5}" width="10" height="10" rx="2" />`;
      })}
    `;
  }

  private _resolveNode(node: SchemaNode): ResolvedNode {
    const addons = this._resolveAddons(node);
    const visual = resolveNodeVisualState(this._states.value, node, this._formatters.value);
    if (node.type === "heat_pump") {
      const hp = heatPumpState(visual, addons, Boolean(node.entity_id));
      visual.active = hp.running;
      visual.operation = hp.operation;
    } else if (!node.entity_id) {
      visual.active = activeFromAddons(addons);
    }
    return { visual, addons };
  }

  /**
   * A running heat pump without status entities heats hot water while its 3-way valve points to the tank;
   * this also refines a climate's generic `hvac_action: heating`.
   */
  private _inferOperations(resolved: Map<string, ResolvedNode>): void {
    for (const node of this.schema.nodes) {
      const visual = resolved.get(node.id)?.visual;
      if (node.type !== "heat_pump" || !visual?.active) continue;
      const hasStatus = node.addons?.some((a) => a.type === "operation" && a.entity_id);
      if (visual.operation && (hasStatus || visual.operation !== "heating")) continue;
      const valve = dhwValveBranch(this.schema, node.id);
      const branch = valve && resolved.get(valve.valveId)?.visual.valveBranch;
      if (valve && branch) visual.operation = branch === valve.branch ? "dhw" : "heating";
    }
  }

  private _resolveAddons(node: SchemaNode): ResolvedAddon[] {
    const states = this._states.value;
    const formatters = this._formatters.value;
    return (node.addons ?? []).map((config, index) => {
      const state = { ...resolveNodeVisualState(states, config, formatters), label: config.name };
      return {
        config,
        index,
        state: ADDON_TYPES[config.type]?.display === "binary" ? withNumericActivity(config, state) : state,
      };
    });
  }

  private _isActionable(target: Parameters<typeof actionTarget>[1]): boolean {
    if (this.editable) return false;
    const config = actionTarget(this.schema, target);
    return config !== undefined && (canTap(config) || hasAction(config.hold_action) || hasAction(config.double_tap_action));
  }

  private _badgeWidth(rect: Rect): number {
    return Math.max(rect.width, BADGE_MIN_WIDTH);
  }

  private _renderNode(node: SchemaNode, t: Translator, resolved = this._resolveNode(node)): TemplateResult {
    const def = getNodeDefinition(node);
    if (!def) return html``;

    const selected = this.selectedNodeId === node.id;
    const { addons, visual: visualState } = resolved;
    const deviceSvg = renderDeviceByType(node.type, def, t, selected, visualState, { addons, hideCop: node.hide_cop });
    if (!deviceSvg) return html``;

    const rotation = normalizeRotation(node.rotation);
    const rect = getNodeBounds(node, def);
    // Ports on the top edge (manifold loops) would sit on the label, so it moves up.
    const topPort = def.ports.some((p) => (getAbsolutePort(node, p.id)?.y ?? Infinity) <= rect.y + 1);
    const labelY = rect.y - node.position.y - (topPort ? 12 : 4);
    const badges = badgeAddons(node.type, addons);
    const typeName = node.name || t.t(def.labelKey);
    const name = visualState.operation ? `${typeName} · ${t.t(`operation.${visualState.operation}`)}` : typeName;
    const actionable = this._isActionable({ nodeId: node.id });

    return svg`
      <g
        class="node ${this._dragNodeId === node.id ? "dragging" : ""} ${actionable ? "actionable" : ""}"
        data-node-id="${node.id}"
        role="${actionable ? "button" : "img"}"
        tabindex="${actionable ? "0" : nothing}"
        aria-label="${nodeDescription(name, visualState, Boolean(node.entity_id), addons, t)}"
        transform="translate(${node.position.x} ${node.position.y})"
      >
        <g transform="rotate(${rotation} ${def.width / 2} ${def.height / 2})">
          ${deviceSvg}
        </g>
        ${def.hideLabel && !node.name
          ? nothing
          : svg`<text x="${def.labelOffset?.x ?? def.width / 2}" y="${labelY - (def.labelOffset?.y ?? 0)}" text-anchor="middle" class="device-label">${name}</text>`}
        ${badges.length
          ? renderAddonBadges(
              badges,
              t,
              rect.x - node.position.x,
              rect.y - node.position.y + rect.height + BADGE_OFFSET,
              this._badgeWidth(rect)
            )
          : nothing}
      </g>
    `;
  }

  private _renderOverlay(overlay: HeatingSchema["overlays"][number]): TemplateResult {
    const states = this._states.value;
    const formatters = this._formatters.value;
    const text = formatOverlayValue(states, formatters, overlay);
    const style = resolveOverlayStyle(states, overlay);
    if (!style.visible) return html``;

    const label = formatOverlayName(states, formatters, overlay);
    const display = `${label}: ${text}`;
    const width = Math.max(80, display.length * 7 + 16);
    const actionable = this._isActionable({ overlayId: overlay.id });

    return svg`
      <g
        class="overlay-group ${style.className ?? ""} ${actionable ? "actionable" : ""}"
        data-overlay-id="${overlay.id}"
        role="${actionable ? "button" : "img"}"
        tabindex="${actionable ? "0" : nothing}"
        aria-label="${display}"
        transform="translate(${overlay.position.x} ${overlay.position.y})"
      >
        <rect class="overlay-bg" x="0" y="0" width="${width}" height="22" rx="4" />
        <text class="overlay-text" x="8" y="15" style="${style.color ? `fill: ${style.color}` : ""}">
          ${display}
        </text>
      </g>
    `;
  }

  private _onCanvasPointerDown(ev: PointerEvent): void {
    if (!this.editable) {
      this._startPress(ev);
      return;
    }

    const target = ev.target as SVGElement | null;
    const segmentEdge = target?.getAttribute?.("data-edge");
    const segment = target?.getAttribute?.("data-segment");
    if (this.drawing && segmentEdge && segment) {
      this._startSegmentDrag(ev, segmentEdge, Number(segment), target);
      return;
    }
    const edgeId = target?.getAttribute?.("data-edge-id");
    if (edgeId) {
      this.dispatchEvent(
        new CustomEvent("edge-select", {
          detail: { edgeId },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    const nodeEl = target?.closest?.("[data-node-id]") as SVGGraphicsElement | null;
    if (!nodeEl) {
      this._dispatchSelect(undefined);
      return;
    }

    const nodeId = nodeEl.getAttribute("data-node-id");
    if (!nodeId) return;

    const node = this.schema.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const portEl = target?.closest?.("[data-port-id]") as SVGElement | null;
    if (portEl && this.drawing) {
      const portId = portEl.getAttribute("data-port-id");
      if (portId) {
        this._dispatchPortClick(nodeId, portId);
        ev.stopPropagation();
        return;
      }
    }

    if (!this.drawing) {
      this._dispatchSelect(nodeId);
      return;
    }

    this._dragNodeId = nodeId;
    const local = this._toLocal(ev);
    this._dragOffset = local
      ? { x: local.x - node.position.x, y: local.y - node.position.y }
      : { x: 0, y: 0 };
    this._dragBounds = this._computeBounds(this.schema.nodes);
    nodeEl.setPointerCapture(ev.pointerId);
    this._dispatchSelect(nodeId);
    ev.preventDefault();
  }

  private _startSegmentDrag(ev: PointerEvent, id: string, index: number, handle: SVGElement | null): void {
    const connection = this.schema.connections.find((c) => connectionId(c) === id);
    const skeleton = connection ? this._layoutPipe(connection)?.skeleton : undefined;
    const start = this._toLocal(ev);
    if (!skeleton || !start || !skeleton[index + 1]) return;
    this._segmentDrag = { id, index, horizontal: skeleton[index].y === skeleton[index + 1].y, start, skeleton };
    this._dragBounds = this._computeBounds(this.schema.nodes);
    handle?.setPointerCapture(ev.pointerId);
    ev.preventDefault();
    ev.stopPropagation();
  }

  private _moveSegment(ev: PointerEvent): void {
    const drag = this._segmentDrag;
    const local = drag && this._toLocal(ev);
    if (!drag || !local) return;
    const delta = drag.horizontal ? local.y - drag.start.y : local.x - drag.start.x;
    this._routePreview = { id: drag.id, route: moveSegment(drag.skeleton, drag.index, delta, GRID_SIZE) };
    this.requestUpdate();
  }

  private _endSegmentDrag(): void {
    const preview = this._routePreview;
    this._segmentDrag = undefined;
    this._routePreview = undefined;
    this._dragBounds = undefined;
    if (preview) {
      this.dispatchEvent(
        new CustomEvent("connection-route", {
          detail: { connectionId: preview.id, route: preview.route },
          bubbles: true,
          composed: true,
        })
      );
    }
    this.requestUpdate();
  }

  /** Arrow keys move the selected device by one grid step, with Shift by five. */
  private _onKeyDown(ev: KeyboardEvent): void {
    if (!this.editable) {
      this._onActionKey(ev);
      return;
    }
    const direction = ARROW_KEYS[ev.key];
    const node = this.schema.nodes.find((n) => n.id === this.selectedNodeId);
    if (!this.editable || !direction || !node) return;
    ev.preventDefault();
    const step = ev.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;
    this.dispatchEvent(
      new CustomEvent("node-move", {
        detail: {
          nodeId: node.id,
          position: {
            x: snapToGrid(node.position.x + direction.x * step, GRID_SIZE),
            y: snapToGrid(node.position.y + direction.y * step, GRID_SIZE),
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Enter or Space on a focused device or overlay acts like a tap. */
  private _onActionKey(ev: KeyboardEvent): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const el = ev.target as Element | null;
    const nodeId = el?.getAttribute?.("data-node-id") ?? undefined;
    const overlayId = el?.getAttribute?.("data-overlay-id") ?? undefined;
    if (!nodeId && !overlayId) return;
    const config = actionTarget(this.schema, { nodeId, overlayId });
    if (!config || !canTap(config)) return;
    ev.preventDefault();
    this._fireAction(config, "tap", nodeId);
  }

  private _toLocal(ev: PointerEvent): Point | undefined {
    const svgEl = this.renderRoot.querySelector<SVGSVGElement>("svg.schema");
    const ctm = svgEl?.getScreenCTM();
    if (!svgEl || !ctm) return undefined;
    const pt = svgEl.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    return pt.matrixTransform(ctm.inverse());
  }

  private _onCanvasPointerMove(ev: PointerEvent): void {
    const press = this._press;
    if (press && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > MOVE_TOLERANCE) this._cancelPress();
    if (this._segmentDrag) {
      this._moveSegment(ev);
      return;
    }
    if (!this.editable || !this._dragNodeId) return;

    const node = this.schema.nodes.find((n) => n.id === this._dragNodeId);
    const local = this._toLocal(ev);
    if (!node || !local) return;

    const offset = this._dragOffset ?? { x: 0, y: 0 };
    const position = {
      x: snapToGrid(local.x - offset.x, GRID_SIZE),
      y: snapToGrid(local.y - offset.y, GRID_SIZE),
    };
    if (position.x === node.position.x && position.y === node.position.y) return;

    this.dispatchEvent(
      new CustomEvent("node-move", {
        detail: { nodeId: node.id, position },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onCanvasPointerUp(ev: PointerEvent): void {
    if (this._segmentDrag) {
      this._endSegmentDrag();
      return;
    }
    if (this._press) {
      this._endPress();
      return;
    }
    if (this._dragNodeId) {
      const nodeEl = this.renderRoot.querySelector(
        `[data-node-id="${this._dragNodeId}"]`
      ) as SVGGraphicsElement | null;
      nodeEl?.releasePointerCapture(ev.pointerId);
      this._dragNodeId = undefined;
      this._dragOffset = undefined;
      this._dragBounds = undefined;
      this.requestUpdate();
    }
  }

  private _onCanvasPointerLeave(ev: PointerEvent): void {
    this._cancelPress();
    this._onCanvasPointerUp(ev);
  }

  private _startPress(ev: PointerEvent): void {
    const el = ev.target as Element | null;
    const nodeId = el?.closest?.("[data-node-id]")?.getAttribute("data-node-id") ?? undefined;
    const overlayId = el?.closest?.("[data-overlay-id]")?.getAttribute("data-overlay-id") ?? undefined;
    const addon = el?.closest?.("[data-addon-index]")?.getAttribute("data-addon-index") ?? undefined;
    const config = actionTarget(this.schema, {
      nodeId,
      overlayId,
      addonIndex: addon === undefined || addon === "" ? undefined : Number(addon),
    });
    if (!config) return;

    const press: Press = {
      key: `${overlayId ?? nodeId}/${addon ?? ""}`,
      config,
      nodeId: overlayId ? undefined : nodeId,
      x: ev.clientX,
      y: ev.clientY,
      held: false,
    };
    if (hasAction(config.hold_action)) {
      press.timer = window.setTimeout(() => {
        press.held = true;
        this._fireAction(config, "hold", press.nodeId);
      }, HOLD_MS);
    }
    this._press = press;
  }

  private _cancelPress(): void {
    window.clearTimeout(this._press?.timer);
    this._press = undefined;
  }

  private _endPress(): void {
    const press = this._press;
    this._cancelPress();
    if (!press || press.held) return;
    const { config, key, nodeId } = press;

    if (!hasAction(config.double_tap_action)) {
      if (canTap(config)) this._fireAction(config, "tap", nodeId);
      return;
    }
    if (this._pendingTap?.key === key) {
      window.clearTimeout(this._pendingTap.timer);
      this._pendingTap = undefined;
      this._fireAction(config, "double_tap", nodeId);
      return;
    }
    window.clearTimeout(this._pendingTap?.timer);
    this._pendingTap = {
      key,
      timer: window.setTimeout(() => {
        this._pendingTap = undefined;
        if (canTap(config)) this._fireAction(config, "tap", nodeId);
      }, DOUBLE_TAP_MS),
    };
  }

  /** `detail` opens the heat pump detail in the card; everything else goes to the Home Assistant frontend. */
  private _fireAction(config: ActionHandlerConfig, action: ActionKind, nodeId?: string): void {
    if (config[`${action}_action`]?.action === DETAIL_ACTION) {
      if (nodeId) this._openDetail(nodeId);
      return;
    }
    this.dispatchEvent(new CustomEvent("hass-action", { detail: { config, action }, bubbles: true, composed: true }));
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelPress();
    window.clearTimeout(this._pendingTap?.timer);
    this._pendingTap = undefined;
  }

  private _dispatchSelect(nodeId: string | undefined): void {
    this.dispatchEvent(
      new CustomEvent("node-select", {
        detail: { nodeId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _dispatchPortClick(nodeId: string, portId: string): void {
    this.dispatchEvent(
      new CustomEvent("port-click", {
        detail: { nodeId, portId },
        bubbles: true,
        composed: true,
      })
    );
  }
}
