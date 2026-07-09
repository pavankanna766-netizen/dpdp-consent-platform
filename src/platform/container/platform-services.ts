export const PlatformServices = {

    AUDIT:"audit",

    LOGGER:"logger",

    WORKFLOW:"workflow",

    NOTIFICATIONS:"notifications",

    METRICS:"metrics",

    JOBS:"jobs",

} as const;

export type PlatformServiceName =
(typeof PlatformServices)[keyof typeof PlatformServices];