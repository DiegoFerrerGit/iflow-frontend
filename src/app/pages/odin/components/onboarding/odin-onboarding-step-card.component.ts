import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdinOnboardingStepConfig } from '../../../../modules/odin/onboarding/models/interfaces/odin-onboarding.interfaces';

/**
 * Floating instruction card for the ODIN onboarding.
 * Renders title, description, support text, and navigation buttons.
 * Positioned by the parent overlay component.
 */
@Component({
  selector: 'app-odin-onboarding-step-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
    }

    .step-card {
      background: rgba(15, 15, 25, 0.95);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      box-shadow:
        0 0 60px rgba(0, 0, 0, 0.5),
        0 0 40px rgba(137, 90, 246, 0.12),
        0 0 80px rgba(137, 90, 246, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      animation: cardEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .step-card.green-glow {
      box-shadow:
        0 0 60px rgba(0, 0, 0, 0.5),
        0 0 50px rgba(16, 185, 129, 0.25),
        0 0 100px rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .step-card.green-glow .step-dot.active {
      background: rgba(16, 185, 129, 0.8);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    .step-card.green-glow .step-dot.completed {
      background: rgba(16, 185, 129, 0.4);
    }

    .step-card.green-glow .support-text {
      background: rgba(16, 185, 129, 0.06);
      border-color: rgba(16, 185, 129, 0.2);
      color: rgba(16, 185, 129, 0.85);
    }

    .green-highlight {
      color: rgb(52, 211, 153);
      font-weight: 700;
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .step-indicator {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
    }

    .step-dot {
      width: 24px;
      height: 3px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .step-dot.active {
      background: rgba(137, 90, 246, 0.8);
      box-shadow: 0 0 8px rgba(137, 90, 246, 0.4);
    }

    .step-dot.completed {
      background: rgba(137, 90, 246, 0.4);
    }

    .card-title {
      font-size: 22px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .card-description {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.7;
      white-space: pre-line;
      margin-bottom: 16px;
    }

    .support-text {
      font-size: 13px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.45);
      line-height: 1.7;
      white-space: pre-line;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 16px;
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 28px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: white;
      background: linear-gradient(135deg, rgba(137, 90, 246, 0.9), rgba(99, 60, 200, 0.9));
      border: 1px solid rgba(137, 90, 246, 0.3);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 0 20px rgba(137, 90, 246, 0.15);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, rgba(150, 105, 255, 0.95), rgba(115, 75, 220, 0.95));
      box-shadow: 0 0 30px rgba(137, 90, 246, 0.25);
      transform: translateY(-1px);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      color: rgba(255, 255, 255, 0.8);
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.03);
    }

    .btn-skip {
      display: inline-flex;
      align-items: center;
      padding: 6px 0;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.3);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.2s ease;
      letter-spacing: 0.03em;
    }

    .btn-skip:hover {
      color: rgba(255, 255, 255, 0.5);
    }

    .actions-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions-right {
      display: flex;
      align-items: center;
    }
  `],
  template: `
    <div class="step-card" [class.green-glow]="isGreenGlow">
      <!-- Step progress indicator -->
      <div class="step-indicator">
        @for (dot of stepDots; track dot) {
          <div class="step-dot" [class.active]="dot === currentIndex" [class.completed]="dot < currentIndex"></div>
        }
      </div>

      <!-- Content -->
      <h3 class="card-title">{{ config.title }}</h3>
      <p class="card-description" [innerHTML]="descriptionHtml"></p>

      @if (config.supportText) {
        <div class="support-text">{{ config.supportText }}</div>
      }

      <!-- Actions -->
      <div class="card-actions">
        <div class="actions-left">
          @if (config.secondaryCta && currentIndex > 0 && config.secondaryCta !== 'Omitir onboarding') {
            <button class="btn-secondary" (click)="previous.emit()">{{ config.secondaryCta }}</button>
          }
        </div>

        <div class="actions-right">
          <button class="btn-primary" (click)="next.emit()">{{ config.primaryCta }}</button>
        </div>
      </div>
    </div>
  `
})
export class OdinOnboardingStepCardComponent {
  @Input({ required: true }) config!: OdinOnboardingStepConfig;
  @Input() currentIndex: number = 0;
  @Input() totalSteps: number = 6;
  @Input() isGreenGlow: boolean = false;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  public get stepDots(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i);
  }

  public get descriptionHtml(): string {
    if (!this.config?.description) return '';
    let text = this.config.description;
    if (this.isGreenGlow) {
      text = text.replace(/invertir primero/gi, '<span class="green-highlight">invertir primero</span>');
    }
    // Convert newlines to <br>
    return text.replace(/\n/g, '<br>');
  }
}
