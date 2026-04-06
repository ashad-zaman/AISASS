import { SetMetadata } from '@nestjs/common';

export const ENTITY_KEY = 'entity';
export const Entity = () => SetMetadata(ENTITY_KEY, true);