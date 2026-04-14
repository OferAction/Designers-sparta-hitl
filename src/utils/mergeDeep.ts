import { PathPattern, shouldTrackPath } from "@/utils/pathMatch";

export const mergeDeep = (draftObj: any, currentObj: any, rootDraftObj: any, exclude?: PathPattern[], path: string = "") => {
  if (typeof draftObj === "function" || typeof currentObj === "function") {
    // to skip function updates
    return draftObj;
  }
  if (!shouldTrackPath(path, exclude)) return;

  for (const key in currentObj) {
    const currentPath = path ? path + "." + key : key;
    if (!shouldTrackPath(currentPath, exclude)) continue;

    if (key in draftObj) {
      const draftValue = draftObj[key];
      const currentValue = currentObj[key];

      // Handle arrays specially to detect deletions and reordering
      if (Array.isArray(draftValue) && Array.isArray(currentValue)) {
        const hasIds = draftValue.length > 0 && typeof draftValue[0] === "object" && draftValue[0] !== null && "id" in draftValue[0];

        if (hasIds) {
          const draftMap = new Map(draftValue.map((item: any) => [item.id, item]));
          const currentMap = new Map(currentValue.map((item: any) => [item.id, item]));

          // Handle deletions - remove items not in current state
          for (let i = draftValue.length - 1; i >= 0; i--) {
            const item = draftValue[i];
            if (!currentMap.has(item.id)) {
              draftValue.splice(i, 1); // Remove the item that was deleted
            }
          }

          // Handle additions and updates
          currentValue.forEach((item: any) => {
            if ("id" in item && draftMap.has(item.id)) {
              const existingIndex = draftValue.findIndex((obj) => obj.id === item.id);
              if (existingIndex !== -1) {
                mergeDeep(draftValue[existingIndex], item, rootDraftObj, exclude, currentPath + "." + existingIndex);
              }
            } else {
              const currentIndex = currentValue.indexOf(item);
              const targetPosition = currentIndex !== -1 ? currentIndex : draftValue.length;
              if (currentIndex !== -1 && currentIndex < draftValue.length) {
                draftValue.splice(targetPosition, 0, item);
              } else {
                draftValue.push(item);
              }
            }
          });
        } else {
          if (draftValue.length === 0 && currentValue.length === 0) {
            draftObj[key] = draftValue;
          } else {
            draftObj[key] = currentValue;
          }
        }
      }
      // Recursively handle nested objects
      else if (typeof draftValue === "object" && draftValue && typeof currentValue === "object" && currentValue) {
        mergeDeep(draftValue, currentValue, rootDraftObj, exclude, currentPath);
      }
      // Handle primitive values
      else {
        if ([undefined, null, false, 0].includes(currentValue) && [undefined, null, false, 0].includes(draftValue)) {
          draftObj[key] = draftValue;
        } else {
          draftObj[key] = currentValue;
        }
      }
    } else if (Array.isArray(draftObj) && !Array.isArray(currentObj)) {
      const pathArr = path.split(".");
      const lastKey = pathArr[pathArr.length - 1];

      const parentObj = pathArr.slice(0, -1).reduce((acc, part) => (acc && acc[part] ? acc[part] : null), rootDraftObj);
      parentObj[lastKey] = currentObj;
    } else {
      draftObj[key] = currentObj[key];
    }
  }
};
