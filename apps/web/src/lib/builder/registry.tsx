import { componentDefinitions, getComponentDefinition } from "./component-definitions";
import { canAcceptChild, getComponentPlacement } from "./component-placement";

export const componentRegistry = componentDefinitions.map((component) => ({
  ...component,
  ...getComponentPlacement(component.type),
}));

export { getComponentDefinition, canAcceptChild, getComponentPlacement };
export { getPageSummary, getThemeStyles, renderNodePreview } from "./component-preview";
