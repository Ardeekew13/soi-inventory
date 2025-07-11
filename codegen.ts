import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "http://localhost:4000/graphql",
	documents: "graphql/**/*.ts",
	generates: {
		"./generated/graphql.tsx": {
			plugins: [
				"typescript",
				"typescript-operations",
				"typescript-react-apollo",
			],
			config: {
				withHooks: true,
				withHOC: false,
				withComponent: false,
			},
		},
	},
	ignoreNoDocuments: true,
};

export default config;
