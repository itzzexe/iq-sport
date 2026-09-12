import * as migration_20260912_140002_initial from './20260912_140002_initial';

export const migrations = [
  {
    up: migration_20260912_140002_initial.up,
    down: migration_20260912_140002_initial.down,
    name: '20260912_140002_initial'
  },
];
