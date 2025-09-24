import { Step, StepType, FileItem } from "../types/index"; // adjust import paths

export function applyStepsToFiles(
  steps: Step[],
  files: FileItem[]
): { files: FileItem[]; steps: Step[] } | null {
  let originalFiles = [...files];
  let updateHappened = false;

  steps
    .filter(({ status }) => status === "pending")
    .forEach((step) => {
      updateHappened = true;

      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        const finalAnswerRef = currentFileStructure;
        let currentFolder = "";

        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // File case
            const file = currentFileStructure.find(
              (x) => x.path === currentFolder
            );
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: "file",
                path: currentFolder,
                content: step.code,
              });
            } else {
              file.content = step.code;
            }
          } else {
            // Folder case
            const folder = currentFileStructure.find(
              (x) => x.path === currentFolder
            );
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: "folder",
                path: currentFolder,
                children: [],
              });
            }
            currentFileStructure = currentFileStructure.find(
              (x) => x.path === currentFolder
            )!.children!;
          }
        }

        originalFiles = finalAnswerRef;
      }
    });

  if (!updateHappened) return null;

  return {
    files: originalFiles,
    steps: steps.map((s: Step) => ({ ...s, status: "completed" })),
  };
}
