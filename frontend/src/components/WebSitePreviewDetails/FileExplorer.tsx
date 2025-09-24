
import React from "react";
import { Folder, File, FolderOpen } from "lucide-react";
import { FileItem } from "../types";

interface FileExplorerProps {
  files: FileItem[];
  selectedFile?: FileItem | null;
  onFileSelect: (file: FileItem) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, selectedFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

  // Use file path as unique id
  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedFile && selectedFile.path === item.path ? "bg-blue-50 border-r-2 border-blue-600" : ""
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            if (item.type === "folder") {
              setExpandedFolders((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(item.path)) {
                  newSet.delete(item.path);
                } else {
                  newSet.add(item.path);
                }
                return newSet;
              });
            } else {
              onFileSelect(item);
            }
          }}
        >
          {item.type === "folder" ? (
            expandedFolders.has(item.path) ? (
              <FolderOpen className="w-4 h-4 text-blue-600" />
            ) : (
              <Folder className="w-4 h-4 text-blue-600" />
            )
          ) : (
            <File className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm text-gray-900">{item.name}</span>
        </div>
        {item.type === "folder" && item.children && expandedFolders.has(item.path) && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full">
      {files.length > 0 ? (
        <div className="py-2">{renderFileTree(files)}</div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Building your project files...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;