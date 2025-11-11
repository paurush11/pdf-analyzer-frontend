// theme/mantineTheme.ts
import {
    Card,
    Container,
    createTheme,
    Paper,
    rem,
    Select,
    type MantineThemeOverride,
} from '@mantine/core';

const CONTAINER_SIZES: Record<string, string> = {
    xxs: rem('200px'),
    xs: rem('300px'),
    sm: rem('400px'),
    md: rem('500px'),
    lg: rem('600px'),
    xl: rem('1400px'),
    xxl: rem('1600px'),
};

// Orange scale that works in both schemes (primary = "brand")
const brand = [
    '#FFF4E6', '#FFE8CC', '#FFD8A8', '#FFC078', '#FFA94D',
    '#FF922B', '#FD7E14', '#F76707', '#E8590C', '#D9480F',
];

export const mantineTheme: MantineThemeOverride = createTheme({
    fontSizes: {
        xs: rem('12px'),
        sm: rem('14px'),
        md: rem('16px'),
        lg: rem('18px'),
        xl: rem('20px'),
        '2xl': rem('24px'),
        '3xl': rem('30px'),
        '4xl': rem('36px'),
        '5xl': rem('48px'),
    },
    spacing: {
        '3xs': rem('4px'),
        '2xs': rem('8px'),
        xs: rem('10px'),
        sm: rem('12px'),
        md: rem('16px'),
        lg: rem('20px'),
        xl: rem('24px'),
        '2xl': rem('28px'),
        '3xl': rem('32px'),
    },

    // 🔑 Use our own "brand" palette as primary
    primaryColor: 'brand',
    primaryShade: { light: 6, dark: 5 }, // a bit deeper in light, softer in dark
    colors: { brand: brand as unknown as readonly [string, string, string, string, string, string, string, string, string, string, ...string[]] },

    components: {
        Container: Container.extend({
            vars: (_, { size, fluid }) => ({
                root: {
                    '--container-size': fluid
                        ? '100%'
                        : size !== undefined && size in CONTAINER_SIZES
                            ? CONTAINER_SIZES[size]
                            : rem(size),
                },
            }),
        }),
        Paper: Paper.extend({
            defaultProps: { p: 'md', shadow: 'xl', radius: 'md', withBorder: true },
        }),
        Card: Card.extend({
            defaultProps: { p: 'xl', shadow: 'xl', radius: 'var(--mantine-radius-default)', withBorder: true },
        }),
        Select: Select.extend({
            defaultProps: { checkIconPosition: 'right' },
        }),
    },

    // a small hook for our own tokens if you need them in TS
    other: { style: 'mantine' },
});
