
import React from "react";
import { File, Copy } from "lucide-react";
import { FileItem } from "../types";

interface CodeViewerProps {
  files: FileItem[];
  selectedFile: FileItem | null;
  onSelectFile: (file: FileItem) => void;
}

// Recursively flatten all files in the tree
function flattenFiles(items: FileItem[]): FileItem[] {
  let result: FileItem[] = [];
  for (const item of items) {
    if (item.type === "file") {
      result.push(item);
    }
    if (item.children) {
      result = result.concat(flattenFiles(item.children));
    }
  }
  return result;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, selectedFile, onSelectFile }) => {
  const allFiles = flattenFiles(files);
  const currentFile = selectedFile || allFiles[0] || null;

  const handleTabClick = (file: FileItem) => {
    onSelectFile(file);
  };

  const copyToClipboard = (content: string | undefined) => {
    if (content) navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-full flex flex-col">
      {/* File Tabs */}
      <div className="border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          {allFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => handleTabClick(file)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                (currentFile && file.path === currentFile.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <File className="w-4 h-4" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 relative">
        {currentFile ? (
          <div className="h-full">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => copyToClipboard(currentFile.content)}
                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <pre className="h-full overflow-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Select a file to view its code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;