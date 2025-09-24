import React, { createContext, useContext, useState, ReactNode } from "react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
}

interface AppContextType {
  messages: Array<{
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
  }>;
  files: FileItem[];
  isBuilding: boolean;
  buildProgress: number;
  addMessage: (text: string, sender: "user" | "bot") => void;
  setFiles: (files: FileItem[]) => void;
  setIsBuilding: (building: boolean) => void;
  setBuildProgress: (progress: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<AppContextType["messages"]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  const addMessage = (text: string, sender: "user" | "bot") => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const value: AppContextType = {
    messages,
    files,
    isBuilding,
    buildProgress,
    addMessage,
    setFiles,
    setIsBuilding,
    setBuildProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
