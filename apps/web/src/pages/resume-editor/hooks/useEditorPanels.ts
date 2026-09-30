import { useState } from "react";
import type { EditorSidePanel } from "../editorTypes";

/** Open/closed state for the header menus, import dialog, context rail, and fallback blocks. */
export function useEditorPanels() {
  const [importMarkdownOpen, setImportMarkdownOpen] = useState(false);
  const [importMarkdownSource, setImportMarkdownSource] = useState("");
  const [replaceDocument, setReplaceDocument] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<EditorSidePanel>("comments");
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [isSecondaryToolsOpen, setIsSecondaryToolsOpen] = useState(false);
  const [isWorkspaceInfoOpen, setIsWorkspaceInfoOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isFallbackBlocksOpen, setIsFallbackBlocksOpen] = useState(false);

  return {
    importMarkdownOpen,
    setImportMarkdownOpen,
    importMarkdownSource,
    setImportMarkdownSource,
    replaceDocument,
    setReplaceDocument,
    activeSidePanel,
    setActiveSidePanel,
    isContextPanelOpen,
    setIsContextPanelOpen,
    isSecondaryToolsOpen,
    setIsSecondaryToolsOpen,
    isWorkspaceInfoOpen,
    setIsWorkspaceInfoOpen,
    isWorkspaceMenuOpen,
    setIsWorkspaceMenuOpen,
    isViewMenuOpen,
    setIsViewMenuOpen,
    isFallbackBlocksOpen,
    setIsFallbackBlocksOpen,
  };
}
