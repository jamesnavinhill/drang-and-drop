export const blockAuthoringChecklist = [
  {
    id: "family-classification",
    title: "Family classification",
    description: "Assign the block to the shipped family map and set the capability tags that explain how it should behave in reviews and verification.",
  },
  {
    id: "defaults-and-inspector",
    title: "Defaults and inspector fields",
    description: "Define meaningful defaults and keep every editable field represented in the inspector contract.",
  },
  {
    id: "placement-contract",
    title: "Placement contract",
    description: "Declare the allowed destination region kinds and any explicit owned regions the block exposes for nested authoring.",
  },
  {
    id: "render-contract",
    title: "Preview and export render contract",
    description: "Record the shared parity strategy plus any intentional preview-versus-starter differences for the block.",
  },
  {
    id: "verification",
    title: "Verification impact",
    description: "Extend contract, command, drag, or starter verification wherever the new block changes parity or placement coverage.",
  },
  {
    id: "docs-impact",
    title: "Docs impact",
    description: "Update architecture, verification, and authoring docs in the same slice that changes the block system.",
  },
  {
    id: "template-impact",
    title: "Template impact",
    description: "Decide whether an existing starter template or the internal coverage project should exercise the new block.",
  },
] as const;
