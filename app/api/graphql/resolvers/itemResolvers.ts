import Item from "../models/Item";

export const itemResolvers = {
  Query: {
    items: async (
      _: unknown,
      {
        search,
        limit,
        skip,
      }: { search?: string; limit?: number; skip?: number }
    ) => {
      const filter = search ? { name: { $regex: search, $options: "i" } } : {};
      const items = await Item.find(filter)
        .limit(limit ?? 10)
        .skip(skip ?? 0);
      return items;
    },
  },
  Mutation: {},
};
