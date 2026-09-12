import * as migration_20260912_140002_initial from './20260912_140002_initial';
import * as migration_20260912_154245_add_media_prefix from './20260912_154245_add_media_prefix';

export const migrations = [
  {
    up: migration_20260912_140002_initial.up,
    down: migration_20260912_140002_initial.down,
    name: '20260912_140002_initial',
  },
  {
    up: migration_20260912_154245_add_media_prefix.up,
    down: migration_20260912_154245_add_media_prefix.down,
    name: '20260912_154245_add_media_prefix'
  },
];
