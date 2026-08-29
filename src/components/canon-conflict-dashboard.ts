import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { conflictReviewQueue } from '../knowledge/conflict-engine.ts';
import type { KnowledgeConflict } from '../domain/canon.ts';

@customElement('canon-conflict-dashboard')
export class CanonConflictDashboard extends LitElement {
  @state() private conflicts: KnowledgeConflict[] = conflictReviewQueue.list('open');
  @state() private reviewer = '';
  @state() private reason = '';
  private unsubscribe?: () => void;
  static styles = css`:host{display:block;width:100%;max-width:1100px;color:#e5e7eb}.panel{background:#111;border:1px solid #6b1d1d;border-radius:12px;padding:1.25rem}.controls{display:grid;grid-template-columns:1fr 2fr;gap:.75rem;margin:1rem 0}input{background:#090909;border:1px solid #555;color:white;padding:.7rem;border-radius:6px}.conflict{border-top:1px solid #333;padding:1rem 0}.types{color:#f59e0b}.actions{display:flex;gap:.5rem;flex-wrap:wrap}button{background:#6b1d1d;color:white;border:1px solid #b45309;padding:.5rem .75rem;border-radius:6px;cursor:pointer}button:disabled{opacity:.35;cursor:not-allowed}.empty{color:#9ca3af;padding:2rem;text-align:center}@media(max-width:700px){.controls{grid-template-columns:1fr}}`;
  connectedCallback() { super.connectedCallback(); this.unsubscribe = conflictReviewQueue.subscribe(() => { this.conflicts = conflictReviewQueue.list('open'); }); }
  disconnectedCallback() { this.unsubscribe?.(); super.disconnectedCallback(); }
  private resolve(conflict: KnowledgeConflict, action: NonNullable<KnowledgeConflict['resolution']>['action']) { if (!this.reviewer.trim() || !this.reason.trim()) return; conflictReviewQueue.resolve(conflict.id, { action, reviewer: this.reviewer.trim(), reason: this.reason.trim(), resolvedAtUtc: new Date().toISOString() }); }
  render() { const disabled = !this.reviewer.trim() || !this.reason.trim(); return html`<section class="panel"><h1>Kánonkonfliktusok</h1><p>Nyitott konfliktusok: <strong>${this.conflicts.length}</strong></p><div class="controls"><input aria-label="Ellenőrző" placeholder="Ellenőrző azonosító" .value=${this.reviewer} @input=${(event: InputEvent) => this.reviewer = (event.target as HTMLInputElement).value}><input aria-label="Döntés indoklása" placeholder="Döntés indoklása" .value=${this.reason} @input=${(event: InputEvent) => this.reason = (event.target as HTMLInputElement).value}></div>${this.conflicts.length === 0 ? html`<div class="empty">Nincs nyitott kánonkonfliktus.</div>` : this.conflicts.map((conflict) => html`<article class="conflict"><h2>${conflict.severity.toUpperCase()} – ${conflict.claimIds.join(' ↔ ')}</h2><p class="types">${conflict.types.join(', ')}</p><p>${conflict.explanation}</p><div class="actions"><button ?disabled=${disabled} @click=${() => this.resolve(conflict, 'prefer-left')}>Bal állítás</button><button ?disabled=${disabled} @click=${() => this.resolve(conflict, 'prefer-right')}>Jobb állítás</button><button ?disabled=${disabled} @click=${() => this.resolve(conflict, 'branch')}>Külön ág</button><button ?disabled=${disabled} @click=${() => this.resolve(conflict, 'dismiss')}>Elvetés</button></div></article>`)}</section>`; }
}
