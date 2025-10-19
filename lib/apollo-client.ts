import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const runtime = "nodejs"; // <--- This line fixes the issue

const client = new ApolloClient({
	link: new HttpLink({ uri: "/api/graphql" }),
	cache: new InMemoryCache(),
});

export default client;
