import { mergeTypeDefs } from "@graphql-tools/merge";
import { commonTypeDefs } from "./common.typeDefs";
import { itemTypeDefs } from "./item.typeDefs";
import { productTypeDefs } from "./product.typeDefs";
import { saleTypeDefs } from "./sale.typeDefs";
import { userTypeDefs } from "./user.typeDefs";
import discountTypeDefs from "./discount.typeDefs";
import serviceChargeTypeDefs from "./serviceCharge.typeDefs";
import { cashDrawerTypeDefs } from "./cashDrawer.typeDefs";
import { databaseTypeDefs } from "./database.typeDefs";
import { employeeShiftTypeDefs } from "./employeeShift.typeDefs";
import { shiftScheduleTypeDefs } from "./shiftSchedule.typeDefs";

export const typeDefs = mergeTypeDefs([
  commonTypeDefs,
  itemTypeDefs,
  productTypeDefs,
  saleTypeDefs,
  userTypeDefs,
  discountTypeDefs,
  serviceChargeTypeDefs,
  cashDrawerTypeDefs,
  databaseTypeDefs,
  employeeShiftTypeDefs,
  shiftScheduleTypeDefs,
]);