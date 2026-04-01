import { componentDefinitions, getComponentDefinition } from "./component-definitions";
import { componentCanHaveChildren, getComponentPlacement, isRootOnlyComponent } from "./component-placement";

export const componentRegistry = componentDefinitions.map((component) => ({
  ...component,
  ...getComponentPlacement(component.type),
  canHaveChildren: componentCanHaveChildren(component.type),
  rootOnly: isRootOnlyComponent(component.type),
}));

export { getComponentDefinition, componentCanHaveChildren, getComponentPlacement, isRootOnlyComponent };
export { getPageSummary, getThemeStyles, renderNodePreview } from "./component-preview";
