/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient";

import * as configurationConstants from "./core/common/constants/workspace-configuration";
import { ConfigurationError } from "./core/common/errors/configuration-error";
import { checkCreateFolders } from "./core/common/utils/file-utils";
import * as stringUtils from "./core/common/utils/string-utils";
import { globals } from "./core/globals";
import { createLanguageClient } from "./core/language-client/language-client";
import { PlatformHandler } from "./core/platform/platform-handler";
import { SettingManager } from "./core/settings/settings-manager";
import localize from "./i18n/localize";
import { Reporter } from "./telemetry/telemetry";
import { registerCommand } from "./view/common/commands/register-command";
import { setStatusBar } from "./view/common/status-bar/set-status-bar";
import { converterWorkspaceExists } from "./view/common/workspace/converter-workspace-exists";
import { convertCommand } from "./view/user-commands/convert";
import { createConverterWorkspaceCommand } from "./view/user-commands/create-converter-workspace";
import { loginRegistryCommand } from "./view/user-commands/login-registry";
import { logoutRegistryCommand } from "./view/user-commands/logout-registry";
import { pullOfficialTemplatesCommand } from "./view/user-commands/pull-official-templates";
import { pullSampleDataCommand } from "./view/user-commands/pull-sample-data";
import { pullTemplatesCommand } from "./view/user-commands/pull-templates";
import { pushTemplatesCommand } from "./view/user-commands/push-templates";
import { selectDataCommand } from "./view/user-commands/select-data";
import { selectTemplateCommand } from "./view/user-commands/select-template";
import { updateTemplateFolderCommand } from "./view/user-commands/update-template-folder";

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
	// Create telemetry report
	context.subscriptions.push(new Reporter(context));

	// Init setting manager
	globals.settingManager = new SettingManager(
		context,
		configurationConstants.ConfigurationSection,
	);

	// Init workspace
	if (
		converterWorkspaceExists(configurationConstants.WorkspaceFileExtension)
	) {
		// Set status bar
		setStatusBar();

		// Init default result folder
		let resultFolder: string =
			globals.settingManager.getWorkspaceConfiguration(
				configurationConstants.ResultFolderKey,
			);

		if (!resultFolder) {
			resultFolder = path.join(
				globals.settingManager.context.storagePath,
				configurationConstants.DefaultResultFolderName,
			);

			checkCreateFolders(resultFolder);

			await globals.settingManager.updateWorkspaceConfiguration(
				configurationConstants.ResultFolderKey,
				resultFolder,
			);
		}

		// update template folder to workspace folder for showing the template folder in the explorer
		updateTemplateFolderToWorkspaceFolder();

		vscode.workspace.onDidChangeConfiguration(async () => {
			updateTemplateFolderToWorkspaceFolder();
		});

		// Start the client. This will also launch the server
		client = createLanguageClient(context);

		client.start();
	}

	// Register commands
	registerCommand(
		context,
		"microsoft.health.fhir.converter.createConverterWorkspace",
		createConverterWorkspaceCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.convert",
		convertCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.selectData",
		selectDataCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.selectTemplate",
		selectTemplateCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.updateTemplateFolder",
		updateTemplateFolderCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.pullOfficialTemplates",
		pullOfficialTemplatesCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.pullSampleData",
		pullSampleDataCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.pullTemplates",
		pullTemplatesCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.pushTemplates",
		pushTemplatesCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.loginRegistry",
		loginRegistryCommand,
	);

	registerCommand(
		context,
		"microsoft.health.fhir.converter.logoutRegistry",
		logoutRegistryCommand,
	);

	// Extract Oras
	PlatformHandler.getInstance().extractOras();
}

export function deactivate(
	context: vscode.ExtensionContext,
): Thenable<void> | undefined {
	// Stops the language client if it was created
	if (!client) {
		return undefined;
	}

	return client.stop();
}

function updateTemplateFolderToWorkspaceFolder() {
	const templateFolder: string =
		globals.settingManager.getWorkspaceConfiguration(
			configurationConstants.TemplateFolderKey,
		);

	if (templateFolder) {
		const folders = vscode.workspace.workspaceFolders;

		const folderName = stringUtils.generatePrettyFolderName(
			templateFolder,
			localize("common.templateFolder.suffix"),
		);

		if (!folders) {
			vscode.workspace.updateWorkspaceFolders(0, null, {
				uri: vscode.Uri.file(templateFolder),
				name: folderName,
			});
		} else {
			vscode.workspace.updateWorkspaceFolders(0, 1, {
				uri: vscode.Uri.file(templateFolder),
				name: folderName,
			});
		}
	} else {
		throw new ConfigurationError(
			localize("message.noTemplateFolderProvided"),
		);
	}
}
