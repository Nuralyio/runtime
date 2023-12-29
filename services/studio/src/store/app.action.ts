import { $applications, $editorState, $showCreateApplicationModal } from "./apps";


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





