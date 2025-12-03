import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "http://localhost:3000/api/graphql",
	documents: "app/graphql/**/*.{ts,tsx,graphql,gql}",
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
