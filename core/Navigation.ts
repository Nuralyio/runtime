import { ExecuteInstance } from "./runtime-context";

declare const Editor: any;

export class Navigation {

  constructor() {
  }

  static toUrl(url:string) {
    window.location.href = url;
    ExecuteInstance.Event.preventDefault();
    ExecuteInstance.Event.stopPropagation(); 
  }

  static toHash(hash:string) {
    window.location.hash = hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    ExecuteInstance.Event.preventDefault();
    ExecuteInstance.Event.stopPropagation(); 
  }


  getNav() {
  }

  static toPage(pageName: string) {
    ExecuteInstance.Event.preventDefault();
    ExecuteInstance.Event.stopPropagation(); 
    const currentEditingApplication = ExecuteInstance.GetVar("currentEditingApplication");
    const appPages = ExecuteInstance.GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
    const targetPage = appPages.find((pageItem: any) => pageItem.name === pageName);
    ExecuteInstance.VarsProxy.currentPage = targetPage.uuid;
  }
  
}