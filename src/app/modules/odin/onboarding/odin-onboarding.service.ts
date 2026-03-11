import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { OdinOnboardingStore } from './odin-onboarding.store';
import { OdinOnboardingStep } from './models/types/odin-onboarding.types';
import { ODIN_ONBOARDING_STEPS, getStepIndex, ONBOARDING_TARGET_IDS } from './models/constants/odin-onboarding.constants';
import { scrollToTarget } from './odin-onboarding.utils';
import { OdinApiService } from '../odin.api';

/**
 * ODIN Onboarding — Orchestration service
 * Controls the flow: initialization, navigation, skip, and completion.
 */
@Injectable()
export class OdinOnboardingService {

    private readonly store = inject(OdinOnboardingStore);
    private readonly odinApi = inject(OdinApiService);

    /** Emits action events to the page component (e.g. open income/allocation form) */
    private readonly _action$ = new Subject<'openIncomeForm' | 'openAllocationForm'>();
    public readonly action$ = this._action$.asObservable();

    /** Tracks whether income was already created during this onboarding session */
    private incomeCreated = false;

    /**
     * Called after ODIN page data loads.
     * If odinOnboarding is true, activates the onboarding flow.
     * Smart-resumes: if user already has incomes but no allocations, skips to allocation step.
     */
    public async initialize(odinOnboarding: boolean | undefined, hasIncomes: boolean, hasAllocations: boolean): Promise<void> {
        if (!odinOnboarding) return;

        this.incomeCreated = hasIncomes;

        if (hasIncomes && !hasAllocations) {
            // User already created income (e.g. after F5) — go straight to allocation step
            this.store.activate();
            this.store.setStep(OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX);

            // Wait for DOM to render, then scroll to allocation section
            await this.delay(800);
            const allocStep = ODIN_ONBOARDING_STEPS.find(s => s.id === OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX);
            // Scroll down to the allocations section specifically
            // We want it to be roughly centered or near the top, effectively scrolling further down
            // 80 was leaving it too low on some screens. Centering offset = (windowHeight / 2) - 100
            const offset = window.innerHeight * 0.3; // Put top of section 30% down the screen
            await scrollToTarget(ONBOARDING_TARGET_IDS.ALLOCATION_SECTION, offset);
            this.store.markScrollComplete();
        } else if (!hasIncomes) {
            // Fresh start
            this.store.activate();
            // Default step is already CREATE_FIRST_INCOME_SOURCE
        } else if (hasIncomes && hasAllocations) {
            // Backend flag is true but user already has both — likely an anomaly or incomplete save
            // Automatically complete it so it doesn't bother them again
            this.completeOnboarding();
        }
    }

    /**
     * Advance to the next step. Handles autoscroll if the next step targets an element.
     * When transitioning from mock→real data, scrolls to top first and waits for DOM update.
     */
    public async next(): Promise<void> {
        const currentIndex = getStepIndex(this.store.currentStep());
        const nextIndex = currentIndex + 1;

        if (nextIndex >= ODIN_ONBOARDING_STEPS.length) {
            await this.completeOnboarding();
            return;
        }

        const currentStep = ODIN_ONBOARDING_STEPS[currentIndex];
        const nextStep = ODIN_ONBOARDING_STEPS[nextIndex];

        // Transitioning from mock data to real data (EXPLAIN → CREATE)
        // Transitioning from mock data to real data (EXPLAIN → CREATE) or reaching the CREATE_FIRST_INCOME_SOURCE step
        const switchingToReal = currentStep.useMockData && !nextStep.useMockData;
        const switchingToCreateIncome = nextStep.id === OdinOnboardingStep.CREATE_FIRST_INCOME_SOURCE;

        if (switchingToReal || switchingToCreateIncome) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        this.store.setStep(nextStep.id);

        if (switchingToReal || switchingToCreateIncome) {
            await this.delay(600);
        }

        if (nextStep.target) {
            await scrollToTarget(nextStep.target);
            this.store.markScrollComplete();
        }
    }

    /**
     * Go back to the previous step.
     * Blocked once income has been created — only forward from that point.
     */
    public async previous(): Promise<void> {
        if (this.incomeCreated) return;

        const currentIndex = getStepIndex(this.store.currentStep());
        if (currentIndex <= 0) return;

        const prevStep = ODIN_ONBOARDING_STEPS[currentIndex - 1];
        const currentStep = ODIN_ONBOARDING_STEPS[currentIndex];

        // Going back from real to mock data
        const switchingToMock = !currentStep.useMockData && prevStep.useMockData;

        this.store.setStep(prevStep.id);

        if (switchingToMock) {
            await this.delay(300);
        }

        if (prevStep.target) {
            await scrollToTarget(prevStep.target);
            this.store.markScrollComplete();
        }
    }

    /**
     * Skip the onboarding entirely.
     */
    public skip(): void {
        this.odinApi.completeOnboarding().subscribe({
            next: () => this.store.deactivate(),
            error: () => this.store.deactivate()
        });
    }

    /**
     * Called by the overlay when the user clicks "Entendido" on a CREATE step.
     * Dismisses the onboarding card and tells the page component to open the form.
     */
    public requestOpenForm(): void {
        const step = this.store.currentStep();
        this.store.hideOverlay();

        if (step === OdinOnboardingStep.CREATE_FIRST_INCOME_SOURCE) {
            this._action$.next('openIncomeForm');
        } else if (step === OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX) {
            this._action$.next('openAllocationForm');
        }
    }

    /**
     * Re-shows the overlay after a form was cancelled.
     * Keeps the same step but makes the overlay visible again.
     */
    public reShowOverlay(): void {
        this.store.setStep(this.store.currentStep());
    }

    /**
     * Called when the user creates their first income source during onboarding.
     * Advances from CREATE_FIRST_INCOME_SOURCE to CREATE_FIRST_ALLOCATION_BOX.
     */
    public async notifyIncomeCreated(): Promise<void> {
        if (this.store.currentStep() !== OdinOnboardingStep.CREATE_FIRST_INCOME_SOURCE) return;
        this.incomeCreated = true;

        this.store.setStep(OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX);

        // Wait for DOM to settle after modal closes and data updates
        await this.delay(800);

        const allocStep = ODIN_ONBOARDING_STEPS.find(s => s.id === OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX);
        if (allocStep?.target) {
            const offset = window.innerHeight * 0.3;
            await scrollToTarget(allocStep.target, offset);
            this.store.markScrollComplete();
        }
    }

    /**
     * Called when the user creates their first allocation box during onboarding.
     * Completes the onboarding flow.
     */
    public notifyAllocationCreated(): void {
        if (this.store.currentStep() !== OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX) return;
        this.completeOnboarding();
    }

    /**
     * Calls the backend endpoint POST /odin/onboarding-completed
     * and deactivates onboarding on success.
     */
    private async completeOnboarding(): Promise<void> {
        this.odinApi.completeOnboarding().subscribe({
            next: () => this.store.deactivate(),
            error: () => this.store.deactivate()
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
