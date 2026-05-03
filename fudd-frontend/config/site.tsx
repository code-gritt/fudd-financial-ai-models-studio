export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'FUDD',
    title: 'FUDD - Financial Unified Data Dashboard',
    description:
        'Professional financial modeling platform offering LBO, Reverse DCF, Comps, Monte Carlo, M&A, and 3-statement models via REST API or web interface. Open source and enterprise-ready.',
    mainNav: [
        {
            title: 'Models',
            href: '/models',
        },
        {
            title: 'API Docs',
            href: '/docs',
        },
        {
            title: 'Pricing',
            href: '/pricing',
        },
        {
            title: 'GitHub',
            href: 'https://github.com/yourusername/fudd-financial-models',
        },
    ],
    links: {
        twitter: 'https://twitter.com/fudd_finance',
        github: 'https://github.com/yourusername/fudd-financial-models',
        docs: 'https://fudd.dev/docs',
        api: 'https://api.fudd.dev',
        discord: 'https://discord.gg/fudd',
    },
};
