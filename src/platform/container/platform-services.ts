export const PlatformServices = {

    AUDIT:"audit",

    LOGGER:"logger",

    WORKFLOW:"workflow",

    NOTIFICATIONS:"notifications",

    METRICS:"metrics",

    JOBS:"jobs",

    CONFIG:"config",

} as const;

export type PlatformServiceName =
(typeof PlatformServices)[keyof typeof PlatformServices];