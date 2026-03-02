/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotArtifact } from '../chatbot.types.js';
import { ChatPluginBase } from './chat-plugin.js';
import { escapeHtml } from '../utils/index.js';

/**
 * JSON Graph Renderer Plugin — renders JSON artifacts as a visual node graph
 * in the artifact panel, while non-JSON artifacts fall back to default rendering.
 *
 * Demonstrates the `renderArtifactContent` plugin hook: when registered, the
 * chatbot component picks up the renderer automatically — no extra property
 * wiring needed.
 *
 * @example
 * ```typescript
 * const controller = new ChatbotCoreController({
 *   plugins: [
 *     new MarkdownPlugin(),
 *     new ArtifactPlugin(),
 *     new JsonGraphRendererPlugin()
 *   ]
 * });
 * ```
 */
export class JsonGraphRendererPlugin extends ChatPluginBase {
  readonly id = 'json-graph-renderer';
  readonly name = 'JSON Graph Renderer';
  readonly version = '1.0.0';

  // ── Plugin hook ────────────────────────────────────────────────────

  /**
   * Custom artifact content renderer.
   * Returns an HTML string for JSON artifacts; returns empty string for
   * anything else so the default renderer takes over.
   */
  override renderArtifactContent(artifact: ChatbotArtifact): string {
    if (artifact.language !== 'json') return '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(artifact.content);
    } catch {
      return '';  // invalid JSON → fall back to default
    }

    if (parsed === null || typeof parsed !== 'object') return '';

    const rootEntries = Array.isArray(parsed)
      ? (parsed as unknown[]).map((v, i) => this.renderNode(String(i), v))
      : Object.entries(parsed as Record<string, unknown>).map(([k, v]) => this.renderNode(k, v));

    const rootKeyCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;

    return `
      <div style="padding:20px;font-family:system-ui,-apple-system,sans-serif;overflow:auto;">
        <div style="
          display:flex;align-items:center;gap:8px;
          margin-bottom:16px;padding-bottom:12px;
          border-bottom:1px solid #e2e8f0;
        ">
          <span style="
            display:inline-flex;align-items:center;justify-content:center;
            width:28px;height:28px;border-radius:6px;
            background:linear-gradient(135deg,#0ea5e9,#8b5cf6);
            color:#fff;font-size:14px;font-weight:700;
          ">{}</span>
          <span style="font-size:15px;font-weight:600;color:#1e293b;">
            JSON Graph View
          </span>
          <span style="
            margin-left:auto;font-size:12px;padding:2px 8px;border-radius:10px;
            background:#f1f5f9;color:#64748b;
          ">${rootKeyCount} root keys</span>
        </div>
        ${rootEntries.join('')}
      </div>
    `;
  }

  // ── Private helpers ────────────────────────────────────────────────

  /** Recursively render a key/value pair as a tree node */
  private renderNode(key: string, value: unknown, depth = 0): string {
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray  = Array.isArray(value);
    const indent   = depth * 24;

    // Leaf node (primitive)
    if (!isObject && !isArray) {
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-left:${indent}px;margin-bottom:6px;">
          <span style="
            display:inline-block;width:8px;height:8px;border-radius:50%;
            background:${this.typeColor(value)};flex-shrink:0;
          "></span>
          <span style="font-weight:600;font-size:13px;color:#334155;">
            ${escapeHtml(key)}
          </span>
          <span style="
            font-size:13px;padding:2px 8px;border-radius:4px;
            background:${this.typeBg(value)};color:${this.typeColor(value)};
            border:1px solid ${this.typeColor(value)}20;
          ">${escapeHtml(this.formatValue(value))}</span>
        </div>
      `;
    }

    // Object or Array
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>);

    const badge     = isArray ? `[ ${entries.length} ]` : `{ ${entries.length} }`;
    const badgeIcon = isArray ? '[]' : '{}';
    const badgeClr  = isArray ? '#8b5cf6' : '#0ea5e9';

    return `
      <div style="margin-left:${indent}px;margin-bottom:4px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="
            display:inline-flex;align-items:center;justify-content:center;
            width:20px;height:20px;border-radius:4px;
            background:${badgeClr}15;color:${badgeClr};font-size:11px;font-weight:700;
            border:1px solid ${badgeClr}30;
          ">${badgeIcon}</span>
          <span style="font-weight:600;font-size:13px;color:#334155;">
            ${escapeHtml(key)}
          </span>
          <span style="
            font-size:11px;padding:1px 6px;border-radius:10px;
            background:${badgeClr}10;color:${badgeClr};font-weight:500;
          ">${badge}</span>
        </div>
        <div style="margin-left:9px;padding-left:16px;border-left:2px solid #e2e8f0;">
          ${entries.map(([k, v]) => this.renderNode(k, v, 0)).join('')}
        </div>
      </div>
    `;
  }

  private typeColor(val: unknown): string {
    if (val === null) return '#94a3b8';
    switch (typeof val) {
      case 'string':  return '#22c55e';
      case 'number':  return '#3b82f6';
      case 'boolean': return '#f59e0b';
      default:        return '#94a3b8';
    }
  }

  private typeBg(val: unknown): string {
    if (val === null) return '#f1f5f9';
    switch (typeof val) {
      case 'string':  return '#f0fdf4';
      case 'number':  return '#eff6ff';
      case 'boolean': return '#fffbeb';
      default:        return '#f1f5f9';
    }
  }

  private formatValue(val: unknown): string {
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

}
