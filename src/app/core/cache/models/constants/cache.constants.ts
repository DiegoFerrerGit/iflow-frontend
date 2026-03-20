import { HttpContextToken } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export const CACHE_KEY = new HttpContextToken<string | string[] | null>(() => null);
export const CACHE_TTL = new HttpContextToken<number>(() => environment.defaultCacheTtl);
