import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
	uri:
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_API_URL
			: process.env.NEXT_DEV_URL,
	credentials: "include",
});

export const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache(),
});
