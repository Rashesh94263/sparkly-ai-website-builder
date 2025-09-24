import { TabConfig } from "../types/enterprise";

export const tabs: TabConfig[] = [
    {
      id: "files",
      label: "Files",
      icon: "📁",
      component: "FileExplorer",
      order: 1,
      visible: true,
    },
    {
      id: "code",
      label: "Code",
      icon: "💻",
      component: "CodeViewer",
      order: 2,
      visible: true,
    },
    {
      id: "steps",
      label: "Steps",
      icon: "📋",
      component: "StepsList",
      order: 3,
      visible: true,
    },
    {
      id: "preview",
      label: "Preview",
      icon: "👁️",
      component: "Preview",
      order: 4,
      visible: true,
    },
  ];