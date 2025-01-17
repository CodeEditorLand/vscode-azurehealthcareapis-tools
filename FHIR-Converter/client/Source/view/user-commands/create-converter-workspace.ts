/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as path from "path";
import * as vscode from "vscode";

import * as configurationConstants from "../../core/common/constants/workspace-configuration";
import * as fileUtils from "../../core/common/utils/file-utils";
import * as stringUtils from "../../core/common/utils/string-utils";
import { PlatformHandler } from "../../core/platform/platform-handler";
import localize from "../../i18n/localize";
import * as interaction from "../common/file-dialog/file-dialog-interaction";

export async function createConverterWorkspaceCommand() {
	let templateFolder: vscode.Uri;

	let dataFolder: vscode.Uri;

	let workspacePath: vscode.Uri;

	// Select root template folder
	templateFolder = await interaction.openDialogSelectFolder(
		localize("message.selectRootTemplateFolder"),
	);

	if (!templateFolder) {
		return undefined;
	}

	// Get the parent folder of templateFolder to set the default folder in dialog
	const parentFolder = path.dirname(templateFolder.fsPath);

	// Select data folder
	dataFolder = await interaction.openDialogSelectFolder(
		localize("message.selectDataFolder"),
		parentFolder,
	);

	if (!dataFolder) {
		return undefined;
	}

	const defaultWorkspaceUri =
		PlatformHandler.getInstance().getDefaultWorkspaceUri(parentFolder);

	// Select workspace path
	workspacePath = await interaction.showDialogSaveWorkspace(
		localize("message.saveWorkspaceFileAs"),
		configurationConstants.WorkspaceFileExtension,
		defaultWorkspaceUri,
	);

	if (!workspacePath) {
		return undefined;
	}

	// Init workspace configuration
	const workspaceConfig = getDefaultConverterWorkspaceConfig(
		templateFolder.fsPath,
		dataFolder.fsPath,
	);

	// Save the workpace configuration
	fileUtils.writeJsonToFile(workspacePath.fsPath, workspaceConfig);

	// Open the workspace
	await vscode.commands.executeCommand(
		"vscode.openFolder",
		workspacePath,
		false,
	);
}

function getDefaultConverterWorkspaceConfig(
	templateFolder?: string,
	dataFolder?: string,
) {
	const folderName = stringUtils.generatePrettyFolderName(
		templateFolder,
		localize("common.templateFolder.suffix"),
	);

	const folders: any[] = [];

	const settings = {
		"workbench.editor.enablePreview": false,
		"diffEditor.renderSideBySide": false,
	};

	if (!templateFolder) {
		folders.push({});
	} else if (templateFolder) {
		folders.push({
			"name": folderName,
			"path": templateFolder,
		});

		settings[
			`${configurationConstants.ConfigurationSection}.${configurationConstants.TemplateFolderKey}`
		] = templateFolder;

		if (dataFolder) {
			folders.push({
				"path": dataFolder,
			});
		}
	}

	return {
		"folders": folders,
		"settings": settings,
	};
}
