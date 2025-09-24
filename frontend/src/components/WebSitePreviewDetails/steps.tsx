import { Step, StepType } from "../../types";

// Second Approach to parse the values to the parser....
// Improved version that handles concatenated tags
export function parseCustomeXML(response: string): Step[] {
  const steps: Step[] = [];
  let stepId = 0;

  // More flexible regex that handles tags with or without spaces/newlines
  const artifacts =
    response.match(/<boltArtifact[^>]*>[\s\S]*?<\/boltArtifact>/g) || [];

  for (const artifactBlock of artifacts) {
    // Extract artifact attributes
    const titleMatch = artifactBlock.match(/title=["']([^"']*)["']/);

    const artifactTitle = titleMatch ? titleMatch[1] : "Untitled Artifact";

    // Add artifact header step
    steps.push({
      id: stepId++,
      title: artifactTitle,
      description: `Initialize ${artifactTitle}`,
      type: StepType.CreateFolder,
      status: "pending",
    });

    // More flexible action extraction
    const actions =
      artifactBlock.match(/<boltAction[^>]*>[\s\S]*?<\/boltAction>/g) || [];

    for (const action of actions) {
      const typeMatch = action.match(/type=["']([^"']*)["']/);
      const filePathMatch = action.match(/filePath=["']([^"']*)["']/);

      // Extract content between opening and closing tags
      const contentMatch = action.match(
        /<boltAction[^>]*>([\s\S]*?)<\/boltAction>/
      );

      if (!typeMatch || !contentMatch) continue;

      const actionType = typeMatch[1];
      const filePath = filePathMatch ? filePathMatch[1] : undefined;
      let content = contentMatch[1];

      // Handle escaped characters
      content = content
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .trim();

      if (actionType === "file" && filePath) {
        steps.push({
          id: stepId++,
          title: `Create ${filePath}`,
          description: `Creating file at ${filePath}`,
          type: StepType.CreateFile,
          status: "pending",
          code: content,
          path: filePath,
        });
      } else if (actionType === "shell") {
        steps.push({
          id: stepId++,
          title: "Run command",
          description: `Execute shell command: ${content.substring(0, 50)}${
            content.length > 50 ? "..." : ""
          }`,
          type: StepType.RunScript,
          status: "pending",
          code: content,
        });
      }
    }
  }

  return steps;
}
