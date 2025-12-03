import { authResolvers } from "./resolvers/authResolver";
import { itemResolvers } from "./resolvers/itemResolvers";
import { productResolvers } from "./resolvers/productResolvers";
import { salesResolver } from "./resolvers/salesResolver";
import discountResolvers from "./resolvers/discountResolvers";
import serviceChargeResolvers from "./resolvers/serviceChargeResolvers";
import { cashDrawerResolvers } from "./resolvers/cashDrawerResolver";
import { databaseResolvers } from "./resolvers/databaseResolver";
import { employeeShiftResolvers } from "./resolvers/employeeShiftResolver";
import { shiftScheduleResolvers } from "./resolvers/shiftScheduleResolver";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...itemResolvers.Query,
    ...productResolvers.Query,
    ...salesResolver.Query,
    ...discountResolvers.Query,
    ...serviceChargeResolvers.Query,
    ...cashDrawerResolvers.Query,
    ...databaseResolvers.Query,
    ...employeeShiftResolvers.Query,
    ...shiftScheduleResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...itemResolvers.Mutation,
    ...productResolvers.Mutation,
    ...salesResolver.Mutation,
    ...discountResolvers.Mutation,
    ...serviceChargeResolvers.Mutation,
    ...cashDrawerResolvers.Mutation,
    ...employeeShiftResolvers.Mutation,
    ...shiftScheduleResolvers.Mutation,
  },
  User: {
    ...authResolvers.User,
  },
  Product: {
    ...productResolvers.Product,
  },
  SaleItem: {
    ...salesResolver.SaleItem,
  },
  Discount: {
    ...discountResolvers.Discount,
  },
  ServiceCharge: {
    ...serviceChargeResolvers.ServiceCharge,
  },
  CashDrawer: {
    ...cashDrawerResolvers.CashDrawer,
  },
};
