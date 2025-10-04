import { v4 as uuid } from "uuid";

export function replaceUUIDs(data) {
  const uuidMapping = {};
  data.forEach(item => {
    const newUUID = uuid();
    uuidMapping[item.uuid] = newUUID;
  });

  data.forEach(item => {
    if (uuidMapping[item.uuid]) {
      item.uuid = uuidMapping[item.uuid];
    }
    if (item.childrenIds) {
      item.childrenIds = item.childrenIds.map(childId => {
        return uuidMapping[childId] || childId;
      });
    }
  });

  return data;
}
