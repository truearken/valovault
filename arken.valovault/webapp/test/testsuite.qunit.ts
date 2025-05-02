export default {
	name: "QUnit test suite for the UI5 Application: arken.valovault",
	defaults: {
		page: "ui5://test-resources/arken/valovault/Test.qunit.html?testsuite={suite}&test={name}",
		qunit: {
			version: 2
		},
		sinon: {
			version: 4
		},
		ui5: {
			language: "EN",
			theme: "sap_horizon"
		},
		coverage: {
			only: "arken/valovault/",
			never: "test-resources/arken/valovault/"
		},
		loader: {
			paths: {
				"arken/valovault": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for arken.valovault"
		},
		"integration/opaTests": {
			title: "Integration tests for arken.valovault"
		}
	}
};
