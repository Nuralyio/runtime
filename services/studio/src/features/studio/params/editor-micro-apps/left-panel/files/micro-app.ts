import { isServer } from '../../../../../runtime/utils/envirement';

export let filesAppUUID = "";
export let filesPageUUID = "";

if (!isServer) {
  filesAppUUID = window.__MODULES_CONFIG__.files.app_uuid;
  filesPageUUID = window.__MODULES_CONFIG__.files.left_file_component_uuid;
}

export const filesMicroApp = {
  application_id: "1",
  uuid: "files_micro_app_block",
  name: "function_micro_app",
  type: "micro_app",
  input: {
    appUUID: {
      type: "string",
      value: filesAppUUID
    },
    componentToRenderUUID: {
      type: "string",
      value: filesPageUUID
    },
    mode: {
      type: "string",
      value: "preview"
    }
  },
};
