import { getAllChildrenRecursive } from "@shared/redux/store/component/store";
import { eventDispatcher } from "@shared/utils/change-detection";

export const setupChangeDetection = () => {

    eventDispatcher.onAny((eventName, {ctx} = {}) => {
        if (eventName.startsWith("ccomponent-property-changed")) {
            // getDirectChildren
            const chdilrensComponent = getAllChildrenRecursive(ctx.application_id, ctx.uuid).get();
            chdilrensComponent.forEach((component) => {
                // eventDispatcher.emit(`component-input-refresh-request:${component.uuid}`)
            })
            // console.log(chdilrensComponent)
            // console.log(`Event: ${eventName}`, ctx);
        }
    })

}