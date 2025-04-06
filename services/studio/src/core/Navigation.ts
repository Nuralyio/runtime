import { ExecuteInstance } from "./Kernel";

declare const Editor: any;

export class Navigation {

  constructor() {
  }

  static toUrl(url:string) {
    window.location.href = url;
  }

  getNav() {
  }

  static toPage(pageName: string) {

    const currentEditingApplication = ExecuteInstance.GetVar("currentEditingApplication");
    const appPages = ExecuteInstance.GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
    const targetPage = appPages.find((pageItem: any) => pageItem.name === pageName);
    ExecuteInstance.VarsProxy.currentPage = targetPage.uuid;
    console.log("targetPage", targetPage);
  }
  
}