import { isServer } from '../../../../runtime/utils/envirement';

export const currentLoadedApplication = isServer ? [] : JSON.parse(window["__INITIAL_CURRENT_APPLICATION_STATE__"] ?? null);
 