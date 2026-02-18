export interface CourseConfig {
    title: string;
    slug: string;
    description: string;
    estimated_duration_minutes: number;
    audience: string;
    prerequisites: string[];
    navigation_mode: 'linear' | 'open';
    ai_features_enabled: boolean;
    completion_certificate: boolean;
    narrative_synopsis?: string;
    modules: string[];
}
export interface ModuleConfig {
    title: string;
    slug: string;
    description?: string;
    objectives: string[];
    estimated_duration_minutes: number;
    lessons: string[];
}
export interface LessonMeta {
    title: string;
    slug: string;
    module_slug: string;
    estimated_duration_minutes: number;
    order: number;
}
export interface LessonContent {
    meta: LessonMeta;
    compiledSource: string;
}
export interface GlossaryEntry {
    term: string;
    definition: string;
    first_lesson?: string;
}
//# sourceMappingURL=course.d.ts.map