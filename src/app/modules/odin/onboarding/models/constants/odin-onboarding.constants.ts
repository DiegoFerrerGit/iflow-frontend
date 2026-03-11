import { OdinOnboardingStep } from '../types/odin-onboarding.types';
import { OdinOnboardingStepConfig } from '../interfaces/odin-onboarding.interfaces';

/**
 * ODIN Onboarding — Step definitions
 * All user-facing text is in Spanish. Code identifiers are in English.
 */

export const ONBOARDING_TARGET_IDS = {
    INCOME_SOURCE_CARD: 'onboarding-income-source',
    POOL_SECTION: 'onboarding-pool-section',
    ALLOCATION_SECTION: 'onboarding-allocation-section',
    ADD_INCOME_ACTION: 'onboarding-add-income-action',
    ADD_ALLOCATION_ACTION: 'onboarding-add-allocation-action'
} as const;

export const ODIN_ONBOARDING_STEPS: OdinOnboardingStepConfig[] = [
    {
        id: OdinOnboardingStep.INTRO,
        title: 'Bienvenido a ODIN',
        description:
            'ODIN te ayuda a decidir qué hacer con tu dinero antes de gastarlo.\n\n' +
            'Primero defines tu estrategia financiera: cuánto destinarás a inversión, ahorro y gastos.\n\n' +
            'En lugar de registrar cada gasto, defines cómo quieres distribuir tu ingreso mensual en diferentes cajas: ' +
            'gastos fijos, calidad de vida, ahorro e inversión.',
        target: null,
        primaryCta: 'Comenzar',
        showSkip: false,
        useMockData: true,
        cardPosition: 'center'
    },
    {
        id: OdinOnboardingStep.EXPLAIN_INCOME_SOURCE,
        title: 'Esta es una fuente de ingreso',
        description:
            'Una fuente de ingreso representa de dónde proviene tu dinero.\n\n' +
            'Puede ser tu salario, rentas, freelancing o cualquier otro flujo mensual.\n\n' +
            'Cada fuente aporta capital que luego se consolida para ser distribuido.',
        target: ONBOARDING_TARGET_IDS.INCOME_SOURCE_CARD,
        primaryCta: 'Siguiente',
        secondaryCta: 'Atrás',
        showSkip: false,
        useMockData: true,
        cardPosition: 'near-target'
    },
    {
        id: OdinOnboardingStep.EXPLAIN_POOL,
        title: 'Aquí se consolida tu capital',
        description:
            'El Pool es el total de dinero disponible.\n\n' +
            'Aquí se suman todas tus fuentes de ingreso para formar el capital total ' +
            'que luego será distribuido a tus Allocation Boxes. (Cajas de Asignacion/Gastos)',
        target: ONBOARDING_TARGET_IDS.POOL_SECTION,
        primaryCta: 'Siguiente',
        secondaryCta: 'Atrás',
        showSkip: false,
        useMockData: true,
        cardPosition: 'near-target'
    },
    {
        id: OdinOnboardingStep.EXPLAIN_ALLOCATIONS,
        title: 'Estas son tus Allocation Boxes',
        description:
            'Las Allocation Boxes definen el destino de tu dinero.\n\n' +
            'Puedes crear cajas permanentes, como gastos fijos o inversión, ' +
            'y también cajas temporales, como ahorro para un objetivo puntual.\n\n' +
            'Aquí es donde defines tu estrategia financiera mensual.',
        supportText:
            '• Permanentes: representan destinos continuos como inversión, gastos fijos o calidad de vida\n' +
            '• Temporales: representan objetivos puntuales, como vacaciones, fondo de emergencia o una compra importante',
        target: ONBOARDING_TARGET_IDS.ALLOCATION_SECTION,
        primaryCta: 'Siguiente',
        secondaryCta: 'Atrás',
        showSkip: false,
        useMockData: true,
        cardPosition: 'near-target'
    },
    {
        id: OdinOnboardingStep.CREATE_FIRST_INCOME_SOURCE,
        title: 'Crea tu primera fuente de ingreso',
        description:
            'Comencemos registrando tu primera fuente de ingreso real.\n\n' +
            'Esto representa el dinero que recibes cada mes y será la base ' +
            'para distribuir tu capital dentro de ODIN.',
        target: ONBOARDING_TARGET_IDS.ADD_INCOME_ACTION,
        primaryCta: 'Entendido',
        secondaryCta: 'Atrás',
        showSkip: false,
        useMockData: true,
        cardPosition: 'near-target'
    },
    {
        id: OdinOnboardingStep.CREATE_FIRST_ALLOCATION_BOX,
        title: 'Crea tu primera Allocation Box',
        description:
            'La filosofía de ODIN es invertir primero.\n\n' +
            'Aunque hoy solo puedas destinar un 10%, lo importante es empezar.\n\n' +
            'Con el tiempo, la idea es aumentar ese porcentaje con más ingresos o reduciendo gastos, ' +
            'hasta que al menos un 50% de tu dinero pueda destinarse a inversión.',
        supportText: 'Tu primera caja idealmente debería ser una caja de inversión.',
        target: ONBOARDING_TARGET_IDS.ADD_ALLOCATION_ACTION,
        primaryCta: 'Entendido',
        showSkip: false,
        useMockData: false,
        cardPosition: 'near-target'
    }
];

/**
 * Returns the ordered index of a step in the flow.
 */
export function getStepIndex(step: OdinOnboardingStep): number {
    return ODIN_ONBOARDING_STEPS.findIndex(s => s.id === step);
}

/**
 * Returns the step config for a given step ID.
 */
export function getStepConfig(step: OdinOnboardingStep): OdinOnboardingStepConfig | undefined {
    return ODIN_ONBOARDING_STEPS.find(s => s.id === step);
}
