import type { Role } from './roles.js';
export type ModuleCategory = 'theory' | 'practice' | 'sandbox' | 'generated' | string;
export interface LearningModuleConfig {
    id: string;
    label: string;
    category: ModuleCategory;
    icon: string;
    route: string;
    requiredRoles: Role[];
    isActive: boolean;
    order: number;
}
export interface LearningModule {
    config: LearningModuleConfig;
}
//# sourceMappingURL=learning-module.interface.d.ts.map