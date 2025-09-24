import { parseCustomeXML } from "../components/WebSitePreviewDetails/steps";



// Example usage and test
export function testParser() {
  const input = `
        Some random text here
        <boltArtifact id="project-import" title="Project Files">
          <boltAction type="file" filePath="eslint.config.js">
    import js from '@eslint/js';
    import globals from 'globals';
          </boltAction>
          Some text in between
          <boltAction type="shell">
    node index.js
          </boltAction>
        </boltArtifact>
        More random text
      `;

  const result = parseCustomeXML(input);
  console.log(JSON.stringify(result, null, 2));
}
