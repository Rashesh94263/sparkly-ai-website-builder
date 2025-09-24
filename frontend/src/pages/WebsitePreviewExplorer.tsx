// Enterprise Modular Build Interface Component
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BuildInterfaceHeader } from "../components/WebSitePreviewDetails/BuildInterfaceHeader";
import { BuildProgressBar } from "../components/WebSitePreviewDetails/BuildProgressBar";
import { TabNavigation } from "../components/WebSitePreviewDetails/TabNavigation";
import { ChatStatusIndicator } from "../components/WebSitePreviewDetails/ChatStatusIndicator";
import { SkeletonList } from "../components/WebSitePreviewDetails/SkeletonLoader";
import { LoadingSpinner } from "../components/WebSitePreviewDetails/LoadingSpinner";
import FileExplorer from "../components/WebSitePreviewDetails/FileExplorer";
import CodeViewer from "../components/WebSitePreviewDetails/CodeViewer"
import { Preview } from "../components/WebSitePreviewDetails/Preview";
import { Step, FileItem, StepType } from "../types/index";
import { useWebContainer } from "../hooks/webContainer";
import { useResponsive } from "../hooks/useResponsive";
import type { FileSystemTree } from "@webcontainer/api";
import { parseCustomeXML } from "../components/WebSitePreviewDetails/steps";
import { logger } from "../services/Logger";
import axios from "axios";
import { BACKEND_URL } from "../config";
import  {tabs}  from "../utils/tabs";

interface WebsitePreviewExplorerProps {
  onBackToChat: () => void;
}

const WebsitePreviewExplorer: React.FC<WebsitePreviewExplorerProps> = ({
  onBackToChat,
}) => {
  const location = useLocation();
  const { prompt: initialPrompt } = location.state || {};
  const [prompt] = useState(initialPrompt);
  const [activeTab, setActiveTab] = useState<
    "files" | "code" | "preview" | "steps"
  >("files");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const webcontainer = useWebContainer();
  // const CHAT_TIMEOUT_SECONDS = 60;
  const remainingSeconds = 60;
  //const [chatTimedOut, setChatTimedOut] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  //const [templatePrompts, setTemplatePrompts] = useState<string[]>([]);
  // New hooks for enhanced features
  const responsive = useResponsive();

  /*  --------------- Logic of the FileUpdate to the Frontend----*/

  // Step/file update logic (same as original)
  useEffect(() => {
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
    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => ({ ...s, status: "completed" }))
      );
    }
    //console.log("Updated files after step processing:", files);
  }, [steps, files]);

  // Mount the structure if WebContainer is available (same as original)
  useEffect(() => {
    type MountEntry =
      | { file: { contents: string } }
      | { directory: FileSystemTree };
    const createMountStructure = (nodes: FileItem[]): FileSystemTree => {
      const tree: FileSystemTree = {};

      const buildEntry = (node: FileItem): MountEntry => {
        if (node.type === "folder") {
          const childrenTree: FileSystemTree = {};
          (node.children || []).forEach((child) => {
            const entry = buildEntry(child);
            const key = child.name;
            (childrenTree as Record<string, MountEntry>)[key] = entry;
          });
          return { directory: childrenTree };
        }
        return { file: { contents: node.content || "" } };
      };

      nodes.forEach((n) => {
        (tree as Record<string, MountEntry>)[n.name] = buildEntry(n);
      });

      return tree;
    };

    const mountStructure: FileSystemTree = createMountStructure(files);

    // Mount the structure if WebContainer is available
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  // Progress bar logic (same as original)
  useEffect(() => {
    if (steps.length === 0) return;
    setIsBuilding(true);
    setBuildProgress(0);
    const totalSteps = Math.max(steps.length, 4);
    const stepsWithProgress = Array.from({ length: totalSteps }, (_, i) => ({
      ...(steps[i] || {}),
      progress: Math.round((i + 1) * (100 / totalSteps)),
    }));
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < stepsWithProgress.length) {
        setBuildProgress(stepsWithProgress[stepIndex].progress);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsBuilding(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [steps]);

  // --- Fetch template and parse steps ---
  async function initTemplate() {
    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/template`,
        { prompt: prompt.trim() },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { prompts, uiPrompts } = response.data;

      setSteps(
        parseCustomeXML(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );

      return prompts;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      setError("Failed to fetch template." + (message ? `: ${message}` : ""));
    } finally {
      setLoading(false);
    }
  }

  // --- Fetch chat response asynchronously ---
  async function initChatAsync(templatePrompts: string[]) {
    try {
      setIsChatLoading(true);
      //setChatTimedOut(false);

      // const controller = new AbortController(); // optional, in case you still want manual abort
      /* const countdown = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          controller.abort();
          clearInterval(countdown);
          setChatTimedOut(true);
          setIsChatLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
*/

      //console.log("Sending chat request with prompts:: ", templatePrompts);

      const stepsResponse = await axios.post(
        `${BACKEND_URL}/api/chat`,
        {
          messages: [...templatePrompts, prompt].map((content) => ({
            role: "user",
            content,
          })),
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      //clearInterval(countdown);

      //console.log("Stepresponse:: "+stepsResponse.data.response.text);

      //const chatText = stepsResponse?.data?.response?.text ?? "";

      setIsChatLoading(false);

      setSteps((s) => [
        ...s,
        ...parseCustomeXML(stepsResponse.data.response.text).map((x) => ({
          ...x,
          status: "pending" as const,
        })),
      ]);
    } catch (error) {
      setIsChatLoading(false);
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      setError(
        "Failed to fetch chat response." + (message ? `: ${message}` : "")
      );
    } finally {
      setIsChatLoading(false);
    }
  }

  // --- Call them sequentially ---
  async function init() {
    try {
      const prompts = await initTemplate();
      if ( Array.isArray(prompts)) {
        if(prompts.length > 0){
          // Chat API Call to the backend to fetch the files to display UI components.
          initChatAsync(prompts); // run async without blocking

        }
      }
    } catch (err) {
      console.error("Failed to initialize templates:", err);
    }
  }

  /*
  async function retryChat() {
    try {
      setChatTimedOut(false);
      setIsChatLoading(true);
      setRemainingSeconds(CHAT_TIMEOUT_SECONDS);

      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });
      const { prompts, uiPrompts } = response.data;

      setSteps(
        parseCustomeXML(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );
      setTemplatePrompts(prompts || []);

      // Start countdown + abortable /chat request
      const controller = new AbortController();
      setChatTimedOut(false);
      setIsChatLoading(true);
      setRemainingSeconds(CHAT_TIMEOUT_SECONDS);
      const countdown = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            controller.abort();
            clearInterval(countdown);
            setChatTimedOut(true);
            setIsChatLoading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const stepsResponse = await axios.post(
        `${BACKEND_URL}/chat`,
        {
          messages: [...(prompts || []), prompt].map((content) => ({
            role: "user",
            content,
          })),
        },
        {
          signal: controller.signal,
          timeout: CHAT_TIMEOUT_SECONDS * 1000,
        }
      );

      clearInterval(countdown);
      setIsChatLoading(false);
      setLoading(false);
      console.log(
        "Steps response from backend:: ",
        stepsResponse.data.response
      );

      setSteps((s) => [
        ...s,
        ...parseCustomeXML(stepsResponse.data.response).map((x) => ({
          ...x,
          status: "pending" as const,
        })),
      ]);
    } catch (error) {
      setIsChatLoading(false);
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      setError("Chat request failed." + (message ? `: ${message}` : ""));
    }
  }*/

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "files" | "code" | "preview" | "steps");
    logger.debug("Tab changed", { from: activeTab, to: tabId });
  };

  /*
  // Enhanced retry function with toast
  const handleRetryChat = async () => {
    try {
      await retryChat();
      addToast({
        type: "success",
        title: "Retry Successful",
        message: "Chat generation retried successfully",
        duration: 3000,
      });
    } catch {
      addToast({
        type: "error",
        title: "Retry Failed",
        message: "Failed to retry chat generation",
        duration: 5000,
      });
    }
  };

  */

  // Render tab content
  const renderTabContent = () => {
    const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

    if (!activeTabConfig) {
      return <div className="p-4 text-center text-gray-500">Tab not found</div>;
    }

    switch (activeTabConfig.component) {
      case "FileExplorer":
        return (
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        );

      case "CodeViewer":
        return (
          <CodeViewer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        );

      case "StepsList":
        return (
          <div className="text-gray-600">
            <ChatStatusIndicator
              isLoading={isChatLoading}
              // isTimedOut={chatTimedOut}
              // onRetry={handleRetryChat}
              className="mb-4"
            />
            {error && (
              <div className="mb-4 text-center text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            {/* Steps List with Enhanced Loading States */}
            <div className="p-4">
              {loading && (
                <div className="mb-4">
                  <LoadingSpinner text="Loading steps..." />
                  <SkeletonList items={3} className="mt-4" />
                </div>
              )}
              {isChatLoading && (
                <div className="mb-4 text-center text-gray-700">
                  <LoadingSpinner
                    text={`Generating project... ${remainingSeconds}s remaining`}
                  />
                </div>
              )}
              {/*}
              {chatTimedOut && (
                <div className="mb-4 text-center">
                  <div className="text-red-600 mb-2">
                    Generation is taking longer than expected.
                  </div>
                  <button
                    onClick={handleRetryChat}
                    className="text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Retry Generation
                  </button>
                </div>
              )}*/}
              {error && (
                <div className="mb-4 text-center text-red-600 bg-red-50 dark:bg-red-900 p-3 rounded">
                  {error}
                </div>
              )}
              {!loading && steps.length > 0 && (
                <ul className="space-y-2">
                  {steps.map((s, idx) => (
                    <li
                      key={idx}
                      className="text-sm mb-1 flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 rounded px-2 py-1 transition-colors"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200 flex-1">
                        {s.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {!loading && steps.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No steps available yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case "Preview":
        return webcontainer ? (
          <Preview webContainer={webcontainer} files={files} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Preview not available
          </div>
        );

      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Component not implemented
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-transparent">
        {/* Header with Theme Toggle */}
        <BuildInterfaceHeader prompt={prompt} />

        {/* Progress Bar with Project Details */}
        <BuildProgressBar progress={buildProgress} isBuilding={isBuilding} />

        {/* Project Details Bar */}
        {isBuilding && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-blue-700">
                  <span className="font-medium">Project:</span>{" "}
                  {prompt?.substring(0, 50)}...
                </div>
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Steps:</span> {steps.length}
                </div>
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Files:</span> {files.length}
                </div>
              </div>
              <div className="text-sm text-blue-600">
                <span className="font-medium">Progress:</span>{" "}
                {Math.round(buildProgress)}%
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Responsive Design */}
        <div
          className={`flex h-[calc(100vh-140px)] ${
            responsive.isMobile ? "flex-col" : ""
          }`}
        >
          {/* Sidebar */}
          <div
            className={`${
              responsive.isMobile ? "w-full h-1/2" : "w-80"
            } bg-white border-gray-200 flex flex-col`}
          >
            {/* Tab Navigation with Icons */}
            <TabNavigation
              tabs={tabs.filter((tab) => tab.id !== "preview")}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">{renderTabContent()}</div>
          </div>

          {/* Main Panel */}
          <div
            className={`flex-1 flex flex-col ${
              responsive.isMobile ? "h-1/2" : ""
            }`}
          >
            {/* Preview Header */}
            <div className="bg-white text-gray-600 border-gray-200 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => handleTabChange("preview")}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded ${
                  activeTab === "preview"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>👁️</span>
                  <span>Preview</span>
                </span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "preview" && renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WebsitePreviewExplorer;
