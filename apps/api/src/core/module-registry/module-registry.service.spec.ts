import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRegistryService } from './module-registry.service';

describe('ModuleRegistryService', () => {
  let service: ModuleRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuleRegistryService],
    }).compile();
    service = module.get<ModuleRegistryService>(ModuleRegistryService);
  });

  it('returns all active modules sorted by order', () => {
    const modules = service.getAll();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((m) => m.isActive)).toBe(true);
    expect(modules[0].order).toBeLessThan(modules[modules.length - 1].order);
  });

  it('returns a module by id', () => {
    const mod = service.getById('custom-course');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('custom-course');
  });

  it('returns undefined for unknown id', () => {
    expect(service.getById('nonexistent')).toBeUndefined();
  });

  it('registers a new module', () => {
    service.register({
      id: 'test-module',
      label: 'Test',
      category: 'custom-course',
      icon: 'BookOpen',
      route: '/test',
      requiredRoles: ['admin'],
      isActive: true,
      order: 99,
    });
    expect(service.getById('test-module')).toBeDefined();
  });
});
