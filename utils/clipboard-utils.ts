import { addComponentAction } from '../redux/actions/component/addComponentAction';
import { $currentApplication } from '../redux/store/apps';
import { extractAllChildrenIds } from '../redux/store/component/helper';
import { $applicationComponents } from '../redux/store/component/store';
import { ExecuteInstance } from '../state/runtime-context';

export function copyCpmponentToClipboard(component : any) {
    delete component.parent;
    delete component.children;
    delete component.childrens;
    const application_id = component.application_id;
    const currentApplicationComponents = $applicationComponents(application_id).get();
    const currentComponent :any = currentApplicationComponents.find(c => c.uuid === component.uuid);
    const componentChildrenIDs = extractAllChildrenIds(currentApplicationComponents, currentComponent);
    const childrenComponents = componentChildrenIDs.map(childId => currentApplicationComponents.find(c => c.uuid === childId));
    delete currentComponent.parent;
    delete currentComponent.children;
    delete currentComponent.childrens;
    const schema = generateNuralyClipboardStructure(currentComponent, childrenComponents);
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2)).then(() => {
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


    // Function to generate a cryptographically secure UUID v4
    function generateUUID() {
        // Use native crypto.randomUUID if available (modern browsers)
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback using crypto.getRandomValues (wider browser support)
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

        const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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

        // Generate a cryptographically secure random suffix
        const randomBytes = crypto.getRandomValues(new Uint8Array(2));
        const suffix = Array.from(randomBytes, byte => byte.toString(36)).join('').substring(0, 4);
        component.name += `_${suffix}`;
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
  