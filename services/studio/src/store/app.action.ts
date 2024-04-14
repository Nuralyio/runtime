import { loadPermission } from "$services/applications.service";
import { $applicationPermission, $applications, $currentApplication, $editorState, $permissionsState, $showCreateApplicationModal, $showShareApplicationModal } from "./apps";
import { updateApplicationActionHandler } from "./handler";


export function openTab(tab: any) {
	// check if tab is already open
	const isTabOpen = $editorState.get().tabs.find((t: any) => t.id === tab.id);
	if (!isTabOpen) {
		$editorState.set({
			...$editorState.get(),
			tabs: [...$editorState.get().tabs, tab],
			currentTab: tab.name,
		});
	}
}

//generate close tab to remove tab from editor state with index
export function closeTab(tab: any) {
	$editorState.set({
		...$editorState.get(),
		tabs: $editorState.get().tabs.filter((t: any) => t.id !== tab.id),
	});
}


//generate close tab to remove tab from editor state with index
export function setCurrentTab(tab: any) {
	$editorState.set({
		...$editorState.get(),
		currentTab: tab,
	});
}


export function setApplication(apps: any) {
	$applications.set(apps);
}


export function showCreateApplicationModalAction() {
	$showCreateApplicationModal.set(true);
}


export function closeCreateApplicationModalAction() {
	$showCreateApplicationModal.set(false);
}



export function showShareApplicationModalAction() {
	$showShareApplicationModal.set(true);
}


export function closeShareApplicationModalAction() {
	$showShareApplicationModal.set(false);
}



export async function loadApplicationPermissionAction( id: string, resource_id:string){
	const permission = await loadPermission( id, resource_id)
	if(permission.data){
		setApplicationPermissionAction(permission.data);
	}
}


export function setApplicationPermissionAction( permission: any){
	
	$applicationPermission.set(permission);
}

export function setDefaultApplicationPageIfNotSet(uuid: string){
	if(!$currentApplication.get().default_page_uuid){
		$currentApplication.set({
			...$currentApplication.get(),
			default_page_uuid: uuid
		})
	}
	updateApplicationActionHandler($currentApplication.get());
}


export function updateApplication( attribute: any){
	$currentApplication.set({
		...$currentApplication.get(),
		...attribute
	})
	updateApplicationActionHandler($currentApplication.get());
}

export function setPermissionMessage(message: string){
	$permissionsState.set({
		...$permissionsState.get(),
		message
	})
}

export function resetPermissionMessage(){
	$permissionsState.set({
		...$permissionsState.get(),
		message: ""
	})
}	