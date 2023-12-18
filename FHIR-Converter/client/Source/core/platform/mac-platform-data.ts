import { WorkspaceFileExtension } from "../common/constants/workspace-configuration";
import { IPlatformData } from "./platform-data";

export class MacPlatformData implements IPlatformData {
	public get orasExecCmd() {
		return "oras-osx";
	}

	public get openFolderCmd() {
		return "open";
	}

	public get defaultWorkspaceFile() {
		return `Untitled.${WorkspaceFileExtension}`;
	}
}
