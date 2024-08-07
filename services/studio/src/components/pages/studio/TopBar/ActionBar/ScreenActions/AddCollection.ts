import { addComponentAction, type AddComponentRequest } from "$store/actions/component";
import { ComponentType } from "$store/component/interface";
import { GenerateName } from "utils/naming-generator";
import { v4 as uuidv4 } from "uuid";

export const AddCollection = () => {

	let componentId = uuidv4();
	const collectionComponent: AddComponentRequest = {
		id: componentId,
		name: GenerateName(ComponentType.Collection),
		component_type: ComponentType.Collection,
		inputHandlers: {},
		styleHandlers: {},
		attributesHandlers: {},
		parameters : {},
		attributes : {},
		errors : {},
		styleBreakPoints: {
			mobile: {},
			tablet: {},
			laptop: {},
		},
		event: {},
		input: {},
		style: {},
		uuid: "",
		childrenIds: []
	}
	addComponentAction(collectionComponent);
}
/*
  handler: () => {
   
		let componentId = uuidv4();
		addComponentAction({
		  id: componentId,
		  name: GenerateName(ComponentType.Collection),
		  component_type: ComponentType.Collection,
		  inputHandlers: {},
		  styleHandlers: {},
		  event: {},
		  input: {},
		  style: {},
		});
		setCurrentComponentIdAction(componentId);
		componentId = uuidv4();
		addComponentAction({
		  id: componentId,
		  name: GenerateName(ComponentType.VerticalContainer),
		  type: ComponentType.VerticalContainer,
		  styleHandlers: {},
		  input: {
			direction: "horizontal",
		  },
		  event: {},
		  style: {
		  },
		});
		setCurrentComponentIdAction(componentId);

		let componentName = GenerateName(ComponentType.TextLabel);
		addComponentAction({
		  id: uuidv4(),
		  name: componentName,
		  component_type: ComponentType.TextLabel,
		  attributes: {
			display: "block",
			fontSize: "16px",
		  },
		  parameters: {
			value: "Text Label",
		  },
		  styleHandlers: {},
		  event: {},
		  input: {},
		  style: {},
		}); 
		componentName = GenerateName(ComponentType.TextLabel);
		addComponentAction({
		  id: uuidv4(),

		  name: componentName,
		  type: ComponentType.TextLabel,
		  attributes: {
			display: "block",
			fontSize: "16px",
		  },
		  parameters: {
			value: "Text Label",
		  },
		  styleHandlers: {},
		  event: {},
		  input: {},
		  style: {},
		});

	  },*/