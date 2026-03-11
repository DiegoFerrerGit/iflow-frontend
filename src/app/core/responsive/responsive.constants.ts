export const SizesDevice = {
    MOBILE: 'MOBILE',
    DESKTOP: 'DESKTOP'
} as const;

export type ResponsiveType = keyof typeof SizesDevice;
