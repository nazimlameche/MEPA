import { Injectable } from '@nestjs/common';
import { MODULE_CONFIGS } from '@ai-edu/shared';
import type { LearningModuleConfig } from '@ai-edu/shared';

@Injectable()
export class ModuleRegistryService {
  private readonly modules = new Map<string, LearningModuleConfig>();

  constructor() {
    MODULE_CONFIGS.forEach((config) => this.register(config));
  }

  register(config: LearningModuleConfig): void {
    this.modules.set(config.id, config);
  }

  getAll(): LearningModuleConfig[] {
    return [...this.modules.values()]
      .filter((m) => m.isActive)
      .sort((a, b) => a.order - b.order);
  }

  getById(id: string): LearningModuleConfig | undefined {
    return this.modules.get(id);
  }
}
