/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as constants from "../../core/common/constants/template-management";
import { TemplateType } from "../../core/common/enum/template-type";
import localize from "../../i18n/localize";
import { showQuickPick } from "../common/input/quick-pick";
import { pullImage } from "../common/registry/pull-image";

export async function pullSampleDataCommand() {
	// Get the template type
	const selectedType = await showQuickPick(
		localize("message.selectSampleDataType"),
		Object.values(TemplateType),
	);
	let imageReference;
	imageReference = constants.SampleDataImageReferences[selectedType];

	// Pull image
	if (imageReference) {
		await pullImage(imageReference, localize("message.pullingSampleData"));
	}
}
