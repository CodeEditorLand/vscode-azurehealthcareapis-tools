/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as fs from "fs";
import localize from "../../i18n/localize";
import * as configurationConstants from "../common/constants/workspace-configuration";
import * as stateConstants from "../common/constants/workspace-state";
import { ConfigurationError } from "../common/errors/configuration-error";
import { ConversionError } from "../common/errors/conversion-error";
import { globals } from "../globals";
import { Converter } from "./converter";
import { FhirConverterEngine } from "./engine/fhir-converter-engine";

export class ConverterEngineFactory {
	private static _instance = new ConverterEngineFactory();
	private constructor() {}

	static getInstance(): ConverterEngineFactory {
		return ConverterEngineFactory._instance;
	}

	createConverter() {
		// Check that the result folder is available
		const resultFolder = globals.settingManager.getWorkspaceConfiguration(
			configurationConstants.ResultFolderKey,
		);
		if (!resultFolder) {
			throw new ConfigurationError(
				localize("message.noResultFolderProvided"),
			);
		}

		// Check if result folder exists
		if (!fs.existsSync(resultFolder)) {
			throw new ConversionError(
				localize("message.resultFolderNotExists", resultFolder),
			);
		}

		// Check that the template folder is available
		const templateFolder: string =
			globals.settingManager.getWorkspaceConfiguration(
				configurationConstants.TemplateFolderKey,
			);
		if (!templateFolder) {
			throw new ConfigurationError(
				localize("message.noTemplateFolderProvided"),
			);
		}

		// Check if template folder exists
		if (!fs.existsSync(templateFolder)) {
			throw new ConversionError(
				localize("message.templateFolderNotExists", templateFolder),
			);
		}

		// Check that the root template is available
		const rootTemplate = globals.settingManager.getWorkspaceState(
			stateConstants.TemplateKey,
		);
		if (!rootTemplate) {
			throw new ConversionError(localize("message.needSelectTemplate"));
		}

		// create the engine
		const engine = new FhirConverterEngine(
			templateFolder,
			rootTemplate,
			resultFolder,
		);

		// create the converter
		return new Converter(engine, resultFolder);
	}
}
