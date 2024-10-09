import { updateComponentAttributes } from "$store/actions/component";
import { $applications, $values } from "$store/apps";
import { $components } from "$store/component/component-sotre";
import type { ComponentElement } from "$store/component/interface";
import { $context, setVar } from "$store/context";
import { addPageHandler,updatePageHandler } from "$store/handlers/pages/handler";
import { eventDispatcher } from "utils/change-detection";
import { isServer } from "utils/envirement";

class Executer {
    static instance: Executer;
    context: Record<string, any> = {};
    applications: Record<string, any> = {};
    Apps: Record<string, any> = {};
    Values: Record<string, any> = {};
    private functionCache: Record<string, Function> = {}; // Cache for generated functions

    private constructor() {
        this.registerContext();
        $applications.subscribe(() => this.registerApplications());
        $components.subscribe(() => this.registerApplications());
        eventDispatcher.on("component:refresh", () => this.registerApplications());
        $values.subscribe((values) => {
            this.Values = values;
        });
    }

    static getInstance(): Executer {
        if (!Executer.instance) {
            Executer.instance = new Executer();
        }
        return Executer.instance;
    }

    registerContext() {
        $context.listen((context: any) => {
            Object.assign(this.context, context);
        });
    }

    registerApplications() {
        const components = $components.get();
        const componentsList = this.flattenedComponents(components);
        let loadedApplication = $applications.get();
        let loadedApplicationObj = {};

        loadedApplication.map((app: any) => {
            loadedApplicationObj[app.uuid] = app.name;
        })

        componentsList.forEach((component: any) => {
            const applicationId = component.applicationId || component.application_id;

            if (!this.context[applicationId]) {
                this.context[applicationId] = {};
            }

            if (!this.context[applicationId][component.uuid]) {
                this.context[applicationId][component.uuid] = { ...component };
            }

            if (!this.applications[applicationId]) {
                this.applications[applicationId] = {};
            }
            if (!this.Apps[loadedApplicationObj[applicationId]]) {
                this.Apps[loadedApplicationObj[applicationId]] = {};
            }
            this.Apps[loadedApplicationObj[applicationId]][component.name] = { ...component };

            this.applications[applicationId][component.name] = { ...component };
        });
    }

    private flattenedComponents(componentsStore: any): any[] {
        return Object.values(componentsStore).flat().filter(component => !component.parent);
    }

    prepareClosureFunction(code: string) {
        if (!this.functionCache[code]) {
            const func = new Function(
                'Item',
                'Current',
                'Values',
                'Apps',
                'SetVar',
                'GetContextVar',
                'GetVar',
                'GetComponent',
                'GetComponents',
                'SetContextVar',
                'AddPage',
                'UpdatePage',
                'context',
                'applications',
                'updateInput',
                'updateEvent',
                'updateStyleHandlers',
                'EventData',
                'updateStyle',
                `return (function() { ${code} }).apply(this);`
            );
            this.functionCache[code] = func;
        }
        return this.functionCache[code];
    }
}

const instance = Executer.getInstance();
export default instance;

export function executeCodeWithClosure(component: any, code: string, EventData: any = {} , item = {}) {
    
    if (isServer) {
        return;
    }
    const context = instance.context;
    const applications = instance.applications;
    const Apps = instance.Apps;
    const Values = instance.Values;

    function SetVar(symbol: string, value: any): void {
        setVar("global", symbol, value);
    }

    function AddPage(page: any, applicationId: string) {
        return new Promise((resolve, reject) => {
            addPageHandler(page, (page) => {
                resolve(page);
            });
        });

    };

    function UpdatePage(page: any, applicationId: string) {
        return new Promise((resolve, reject) => {
            updatePageHandler(page, (page) => {
                resolve(page);
            });
        });

    };

    function updateStyleHandlers(component: ComponentElement, symbol: string, value: any) {
        updateComponentAttributes(component.applicationId, component.uuid, "styleHandlers", { [symbol]: value });

    }

    function GetContextVar(symbol: string, customContentId: string | null, component: any): any {
        const contentId = customContentId || component.applicationId;
        try {
            if (
                context &&
                context[contentId] &&
                context[contentId][symbol] &&
                'value' in context[contentId][symbol]
            ) {
                return context[contentId][symbol].value;
            } else {
                throw new Error("Variable not found or invalid structure.");
            }
        } catch (error) {
            return null;
        }
    }

    function GetVar(symbol: string, verbose: boolean = false): any {
        try {
            if (
                context &&
                context["global"] &&
                context["global"][symbol] &&
                'value' in context["global"][symbol]
            ) {
                return context["global"][symbol].value;
            } else {
                throw new Error("Variable not found or invalid structure.");
            }
        } catch (error) {
            return null;
        }
    }

    function GetComponent(componentUuid: string, applicationId: string): any {
        return Object.values(applications[applicationId] || {}).find(c => c.uuid === componentUuid);
    }

    function GetComponents(componentIds: string[]): any[] {
        return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
    }

    function SetContextVar(symbol: string, value: any, component: any) {
        setVar(component.applicationId, symbol, value);
    }

    function updateInput(component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) {
        const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
        updateComponentAttributes(component.applicationId, component.uuid, "input", eventData);
    }

    function updateEvent(component: ComponentElement, symbol: string, value: any) {
        const eventData = { [symbol]: value };
        updateComponentAttributes(component.applicationId, component.uuid, "event", eventData);
    }
    function updateStyle(component: ComponentElement, symbol: string, value: any) {
        const eventData = { [symbol]: value };
        updateComponentAttributes(component.applicationId, component.uuid, "style", eventData);
    }

    const closureFunction = instance.prepareClosureFunction(code);

    return closureFunction(
        JSON.parse(JSON.stringify(item ?? {})),
        component,
        Values,
        Apps,
        SetVar,
        GetContextVar,
        GetVar,
        GetComponent,
        GetComponents,
        SetContextVar,
        AddPage,
        UpdatePage,
        context,
        applications,
        updateInput,
        updateEvent,
        updateStyleHandlers,
        EventData,
        updateStyle
    );
}
