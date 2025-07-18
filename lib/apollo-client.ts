import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
	// uri: "https://soi-backend.onrender.com/graphql",
	uri: "http://localhost:4000/graphql",
	credentials: "include",
});

export const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache(),
});
