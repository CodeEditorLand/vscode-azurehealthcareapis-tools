/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as vscode from "vscode";

import * as stringUtils from "../../../core/common/utils/string-utils";

export async function showDifferentialView(
	resultFilePath1: vscode.Uri,
	resultFilePath2: vscode.Uri,
	viewColumn = vscode.ViewColumn.Three,
) {
	const resultTitle = stringUtils.getDiffResultFileName(
		resultFilePath1.fsPath,
		resultFilePath2.fsPath,
	);

	return await vscode.commands.executeCommand(
		"vscode.diff",
		resultFilePath1,
		resultFilePath2,
		resultTitle,
		{ viewColumn: viewColumn },
	);
}
