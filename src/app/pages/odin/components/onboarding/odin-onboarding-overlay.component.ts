import {
  Component, inject, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  NgZone, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdinOnboardingStore } from '../../../../modules/odin/onboarding/odin-onboarding.store';
import { OdinOnboardingService } from '../../../../modules/odin/onboarding/odin-onboarding.service';
import { OdinOnboardingStepConfig } from '../../../../modules/odin/onboarding/models/interfaces/odin-onboarding.interfaces';
import { ODIN_ONBOARDING_STEPS, getStepIndex } from '../../../../modules/odin/onboarding/models/constants/odin-onboarding.constants';
import { OdinOnboardingStep } from '../../../../modules/odin/onboarding/models/types/odin-onboarding.types';
import { findOnboardingTarget } from '../../../../modules/odin/onboarding/odin-onboarding.utils';
import { OdinOnboardingStepCardComponent } from './odin-onboarding-step-card.component';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Overlay for the ODIN onboarding flow.
 *
 * Positioned RELATIVE to the content area (not the viewport).
 * Since this component lives inside odin.html → inside the .content-wrapper
 * that already accounts for sidebar margin, centering "just works."
 *
 * Uses an SVG mask to create a cutout around the highlighted target.
 */
@Component({
  selector: 'app-odin-onboarding-overlay',
  standalone: true,
  imports: [CommonModule, OdinOnboardingStepCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 9990;
      pointer-events: none;
    }

    .overlay-backdrop {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9990;
      pointer-events: auto;
      animation: overlayFadeIn 0.3s ease;
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .overlay-svg {
      width: 100%;
      height: 100%;
    }

    /* Card wrapper for near-target steps — positioned absolutely in viewport */
    .card-wrapper {
      position: fixed;
      z-index: 9992;
      pointer-events: auto;
    }

    /*
     * Centered card for INTRO step.
     * This is a fixed overlay but it reads the content-area bounds
     * so it centers within the page, not the full viewport.
     */
    .card-centered {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9992;
      padding: 24px;
      pointer-events: auto;
    }

    .highlight-glow {
      position: fixed;
      z-index: 9991;
      border-radius: 16px;
      box-shadow:
        0 0 0 2px rgba(137, 90, 246, 0.4),
        0 0 30px rgba(137, 90, 246, 0.15),
        0 0 60px rgba(137, 90, 246, 0.08);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `],
  template: `
    @if (store.isActive() && store.showOverlay() && currentConfig) {
      <!-- Dark backdrop covering the full viewport -->
      <div class="overlay-backdrop">
        <svg class="overlay-svg">
          <defs>
            <mask id="onboarding-mask">
              <rect width="100%" height="100%" fill="white" />
              @if (highlightRect) {
                <rect
                  [attr.x]="highlightRect.left - 8"
                  [attr.y]="highlightRect.top - 8"
                  [attr.width]="highlightRect.width + 16"
                  [attr.height]="highlightRect.height + 16"
                  rx="16" ry="16"
                  fill="black"
                />
              }
            </mask>
          </defs>
          <rect
            width="100%" height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#onboarding-mask)"
          />
        </svg>
      </div>

      <!-- Glow around highlighted element -->
      @if (highlightRect) {
        <div class="highlight-glow"
          [style.top.px]="highlightRect.top - 8"
          [style.left.px]="highlightRect.left - 8"
          [style.width.px]="highlightRect.width + 16"
          [style.height.px]="highlightRect.height + 16">
        </div>
      }

      <!-- Step card -->
      @if (currentConfig.cardPosition === 'center') {
        <div class="card-centered" [style.left.px]="contentAreaLeft">
          <app-odin-onboarding-step-card
            [config]="currentConfig"
            [currentIndex]="currentIndex"
            [totalSteps]="totalSteps"
            [isGreenGlow]="isAllocationStep"
            (next)="onNext()"
            (previous)="onPrevious()"
            (skip)="onSkip()"
          />
        </div>
      } @else {
        <div class="card-wrapper"
          [style.top.px]="cardTop"
          [style.left.px]="cardLeft">
          <app-odin-onboarding-step-card
            [config]="currentConfig"
            [currentIndex]="currentIndex"
            [totalSteps]="totalSteps"
            [isGreenGlow]="isAllocationStep"
            (next)="onNext()"
            (previous)="onPrevious()"
            (skip)="onSkip()"
          />
        </div>
      }
    }
  `
})
export class OdinOnboardingOverlayComponent implements OnInit, OnDestroy {
  public readonly store = inject(OdinOnboardingStore);
  private readonly service = inject(OdinOnboardingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  private readonly elRef = inject(ElementRef);

  public highlightRect: HighlightRect | null = null;
  public cardTop: number = 0;
  public cardLeft: number = 0;
  public contentAreaLeft: number = 0;
  public currentConfig: OdinOnboardingStepConfig | null = null;
  public currentIndex: number = 0;
  public readonly totalSteps: number = ODIN_ONBOARDING_STEPS.length;

  public get isAllocationStep(): boolean {
    return this.store.currentStep() === OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX;
  }

  private resizeListener: (() => void) | null = null;
  private scrollListener: (() => void) | null = null;
  private positionInterval: ReturnType<typeof setInterval> | null = null;

  public ngOnInit(): void {
    this.updatePosition();

    this.zone.runOutsideAngular(() => {
      this.resizeListener = () => this.updatePosition();
      this.scrollListener = () => this.updatePosition();
      window.addEventListener('resize', this.resizeListener);
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      this.positionInterval = setInterval(() => this.updatePosition(), 300);
    });
  }

  public ngOnDestroy(): void {
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    if (this.scrollListener) window.removeEventListener('scroll', this.scrollListener);
    if (this.positionInterval) clearInterval(this.positionInterval);
  }

  public onNext(): void {
    const stepId = this.store.currentStep();
    const isCreateStep = stepId === OdinOnboardingStep.CREATE_FIRST_INCOME_SOURCE ||
      stepId === OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX;

    if (isCreateStep) {
      this.service.requestOpenForm();
    } else {
      this.service.next();
    }
    setTimeout(() => this.updatePosition(), 100);
  }

  public onPrevious(): void {
    this.service.previous();
    setTimeout(() => this.updatePosition(), 100);
  }

  public onSkip(): void {
    this.service.skip();
  }

  /**
   * Gets the left edge of the content area by reading the .content-wrapper's position.
   * This is the wrapper in app.html that already accounts for sidebar margin.
   */
  private getContentAreaLeft(): number {
    const wrapper = document.querySelector('.content-wrapper');
    if (wrapper) {
      return wrapper.getBoundingClientRect().left;
    }
    return 0;
  }

  private updatePosition(): void {
    this.contentAreaLeft = this.getContentAreaLeft();

    const config = this.store.currentStepConfig() ?? null;
    this.currentConfig = config;
    this.currentIndex = getStepIndex(this.store.currentStep());

    if (!config || !config.target) {
      this.highlightRect = null;
      this.zone.run(() => this.cdr.markForCheck());
      return;
    }

    const el = findOnboardingTarget(config.target);
    if (!el) {
      this.highlightRect = null;
      this.zone.run(() => this.cdr.markForCheck());
      return;
    }

    const rect = el.getBoundingClientRect();
    this.highlightRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };

    // Position card relative to the target element
    const cardWidth = 440;
    const gap = 24;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try right side
    const rightX = rect.right + gap;
    if (rightX + cardWidth < vw - 24) {
      this.cardLeft = rightX;
      this.cardTop = Math.max(24, Math.min(rect.top, vh - 450));
    }
    // Try left side
    else if (rect.left - gap - cardWidth > this.contentAreaLeft + 24) {
      this.cardLeft = rect.left - gap - cardWidth;
      this.cardTop = Math.max(24, Math.min(rect.top, vh - 450));
    }
    // Fallback: center card in the viewport over the content area
    else {
      const contentWidth = vw - this.contentAreaLeft;
      this.cardLeft = this.contentAreaLeft + Math.max(24, (contentWidth - cardWidth) / 2);
      this.cardTop = Math.max(24, (vh - 450) / 2);
    }

    this.zone.run(() => this.cdr.markForCheck());
  }
}
