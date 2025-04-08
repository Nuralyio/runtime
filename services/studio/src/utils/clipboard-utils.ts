import { addComponentAction } from "$store/actions/component/addComponentAction";
import { $currentApplication } from "$store/apps";
import { extractAllChildrenIds } from "$store/component/helper";
import type { ComponentElement } from "$store/component/interface";
import { $applicationComponents } from "$store/component/store";
import { ExecuteInstance } from "core/Kernel";

export function copyCpmponentToClipboard(component : ComponentElement) {
    const application_id = component.application_id;
    const currentApplicationComponents = $applicationComponents(application_id).get();
    const currentComponent = currentApplicationComponents.find(c => c.uuid === component.uuid);
    const componentChildrenIDs = extractAllChildrenIds(currentApplicationComponents, currentComponent);
    const childrenComponents = componentChildrenIDs.map(childId => currentApplicationComponents.find(c => c.uuid === childId));
    const schema = generateNuralyClipboardStructure(currentComponent, childrenComponents);
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2)).then(() => {
        console.log("Text copied!");
    }).catch(err => {
        console.error("Error while copying:", err);
    });
}

export function pasteComponentFromClipboard() {
    navigator.clipboard.readText().then(clipboardText => {
        traitCompoentFromSchema(clipboardText);
    }).catch(err => {
        console.error("Error while reading the text:", err);
    });
}

export function traitCompoentFromSchema(clipboardText) {
    try {
        const schema = JSON.parse(clipboardText);
        if (schema.version !== "1.0") {
            console.error("Schema version not supported");
            return;
        } else {
            const newSchema = transformSchemaWithNewUUIDs(schema);
            const [rootComponents, childrens] = findRootAndChildren(newSchema);
            const application_id = $currentApplication.get()?.uuid;
             const currentPage =ExecuteInstance.Vars.currentPage;
             childrens.forEach(component => {
                delete component.root;
                addComponentAction(component, currentPage, application_id, false);
            }
            );
            rootComponents.forEach(component => {
                delete component.root;
                addComponentAction(component, currentPage, application_id);
            });
        }
    } catch (err) {
        console.error("Error while reading the text:", err);
    }
}

export function generateNuralyClipboardStructure(component, childrenComponents) {
    const NuralySchema = {
        version: "1.0",
        components: [
            component,
            ...childrenComponents
        ]
    };
    return NuralySchema;
}

function transformSchemaWithNewUUIDs(schema) {
    const uuidMap = new Map();

    // Function to generate a UUID v4
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Generate a new UUID for each component and store the old -> new UUID mapping
    schema.components.forEach(component => {
        const newUUID = generateUUID();
        uuidMap.set(component.uuid, newUUID);
        component.uuid = newUUID;
    });

    // Update childrenIds with the new UUIDs
    schema.components.forEach(component => {
        component.childrenIds = component.childrenIds.map(oldUUID => uuidMap.get(oldUUID) || oldUUID);

        // Add a random suffix to the name
        component.name += `_${Math.random().toString(36).substring(2, 6)}`;
    });

    return schema;
}

function findRootAndChildren(data) {
    const allComponents = data.components;
    const childIds = new Set(allComponents.flatMap(comp => comp.childrenIds));
  
    // Find all root components (those that don't have any parent)
    const rootComponents = allComponents.filter(comp => !childIds.has(comp.uuid));
  
    // Get the rest of the components (those that are not root components)
    const otherComponents = allComponents.filter(comp => childIds.has(comp.uuid));
  
    return [rootComponents, otherComponents];
  }
  