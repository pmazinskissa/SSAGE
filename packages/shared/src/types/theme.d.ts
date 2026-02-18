export interface ThemeColors {
    primary: string;
    primary_light: string;
    primary_hover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    success: string;
    error: string;
    warning: string;
    text_primary: string;
    text_secondary: string;
    border: string;
    link: string;
}
export interface ThemeTypography {
    heading_font: string;
    body_font: string;
    mono_font: string;
    base_size: string;
    line_height: number;
}
export interface ThemeConfig {
    name: string;
    slug: string;
    logo: string;
    favicon: string;
    organization_name: string;
    colors: ThemeColors;
    typography: ThemeTypography;
    border_radius: {
        button: string;
        card: string;
        input: string;
    };
}
//# sourceMappingURL=theme.d.ts.map