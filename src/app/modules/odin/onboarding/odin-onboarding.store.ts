import { Injectable, signal, computed } from '@angular/core';
import { OdinOnboardingState } from './models/interfaces/odin-onboarding.interfaces';
import { OdinOnboardingStep } from './models/types/odin-onboarding.types';
import { getStepConfig } from './models/constants/odin-onboarding.constants';

/**
 * ODIN Onboarding — Signal-based state store
 * Single source of truth for the onboarding UI state.
 */
@Injectable()
export class OdinOnboardingStore {

    private readonly state = signal<OdinOnboardingState>({
        active: false,
        currentStep: OdinOnboardingStep.INTRO,
        useMockData: false,
        highlightTarget: null,
        blockInteraction: false,
        shouldAutoScroll: false,
        showOverlay: false
    });

    // --- Computed selectors ---

    public readonly isActive = computed(() => this.state().active);
    public readonly currentStep = computed(() => this.state().currentStep);
    public readonly useMockData = computed(() => this.state().useMockData);
    public readonly highlightTarget = computed(() => this.state().highlightTarget);
    public readonly blockInteraction = computed(() => this.state().blockInteraction);
    public readonly shouldAutoScroll = computed(() => this.state().shouldAutoScroll);
    public readonly showOverlay = computed(() => this.state().showOverlay);

    public readonly currentStepConfig = computed(() => getStepConfig(this.state().currentStep));

    // --- Mutations ---

    public activate(): void {
        this.state.set({
            active: true,
            currentStep: OdinOnboardingStep.INTRO,
            useMockData: true,
            highlightTarget: null,
            blockInteraction: true,
            shouldAutoScroll: false,
            showOverlay: true
        });
    }

    public setStep(step: OdinOnboardingStep): void {
        const config = getStepConfig(step);
        if (!config) return;

        this.state.update(s => ({
            ...s,
            currentStep: step,
            useMockData: config.useMockData,
            highlightTarget: config.target,
            blockInteraction: true,
            shouldAutoScroll: config.target !== null,
            showOverlay: true
        }));
    }

    public deactivate(): void {
        this.state.update(s => ({
            ...s,
            active: false,
            useMockData: false,
            highlightTarget: null,
            blockInteraction: false,
            shouldAutoScroll: false,
            showOverlay: false,
            currentStep: OdinOnboardingStep.COMPLETED
        }));
    }

    public markScrollComplete(): void {
        this.state.update(s => ({ ...s, shouldAutoScroll: false }));
    }

    public unblockInteraction(): void {
        this.state.update(s => ({ ...s, blockInteraction: false }));
    }

    public hideOverlay(): void {
        this.state.update(s => ({ ...s, showOverlay: false, blockInteraction: false }));
    }
}
