import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export type DeletionResult = {
  __typename?: 'DeletionResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Item = {
  __typename?: 'Item';
  createdAt: Scalars['String']['output'];
  currentStock: Scalars['Float']['output'];
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  pricePerUnit: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  id?: Maybe<Scalars['UUID']['output']>;
  message: Scalars['String']['output'];
  role?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type MonthlySaleReport = {
  __typename?: 'MonthlySaleReport';
  grossProfit?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  totalAmountSales?: Maybe<Scalars['Float']['output']>;
  totalCostOfGoods?: Maybe<Scalars['Float']['output']>;
  totalItemsSold?: Maybe<Scalars['Float']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addItem: Item;
  addProduct: Product;
  deleteItem: DeletionResult;
  deleteProduct: DeletionResult;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  recordSale: SaleResponse;
  voidSale: DeletionResult;
};


export type MutationAddItemArgs = {
  currentStock: Scalars['Float']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  pricePerUnit: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};


export type MutationAddProductArgs = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  items?: InputMaybe<Array<ProductIngredientInput>>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};


export type MutationDeleteItemArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRecordSaleArgs = {
  items: Array<SaleItemInput>;
};


export type MutationVoidSaleArgs = {
  id: Scalars['UUID']['input'];
  voidReason: Scalars['String']['input'];
};

export type Product = {
  __typename?: 'Product';
  availableUnits: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  ingredientsUsed: Array<ProductIngredient>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ProductIngredient = {
  __typename?: 'ProductIngredient';
  id: Scalars['UUID']['output'];
  item: Item;
  itemId: Scalars['UUID']['output'];
  productId: Scalars['UUID']['output'];
  quantityUsed: Scalars['Float']['output'];
};

export type ProductIngredientInput = {
  itemId: Scalars['UUID']['input'];
  quantityUsed: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  items: Array<Item>;
  me: User;
  products: Array<Product>;
  saleReport?: Maybe<SaleReportGroup>;
  sales: Array<Sale>;
};


export type QueryItemsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySaleReportArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type Sale = {
  __typename?: 'Sale';
  costOfGoods: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  grossProfit: Scalars['Float']['output'];
  id: Scalars['UUID']['output'];
  orderNo: Scalars['String']['output'];
  saleItems: Array<SaleItem>;
  status: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  voidReason: Scalars['String']['output'];
};

export type SaleItem = {
  __typename?: 'SaleItem';
  priceAtSale: Scalars['Float']['output'];
  product: Product;
  productId: Scalars['UUID']['output'];
  quantity: Scalars['Float']['output'];
};

export type SaleItemInput = {
  productId: Scalars['UUID']['input'];
  quantity: Scalars['Float']['input'];
};

export type SaleReportGroup = {
  __typename?: 'SaleReportGroup';
  availableYears: Array<Scalars['Int']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  grossProfitPercentage?: Maybe<Scalars['Float']['output']>;
  groupSales: Array<MonthlySaleReport>;
  topProductSold: Array<TopProduct>;
  totalAmountSales?: Maybe<Scalars['Float']['output']>;
  totalCostOfGoods?: Maybe<Scalars['Float']['output']>;
  totalCostPercentage?: Maybe<Scalars['Float']['output']>;
  totalItemsSold?: Maybe<Scalars['Float']['output']>;
  totalSalesPercentage?: Maybe<Scalars['Float']['output']>;
};

export type SaleResponse = {
  __typename?: 'SaleResponse';
  grossProfit: Scalars['Float']['output'];
  id: Scalars['UUID']['output'];
  message: Scalars['String']['output'];
  orderNo: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type TopProduct = {
  __typename?: 'TopProduct';
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  role: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: any, username: string, role: string } };

export type SaleReportQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaleReportQuery = { __typename?: 'Query', saleReport?: { __typename?: 'SaleReportGroup', totalAmountSales?: number | null, totalCostOfGoods?: number | null, grossProfit?: number | null, totalItemsSold?: number | null, totalSalesPercentage?: number | null, totalCostPercentage?: number | null, grossProfitPercentage?: number | null, availableYears: Array<number>, topProductSold: Array<{ __typename?: 'TopProduct', name: string, quantity: number }>, groupSales: Array<{ __typename?: 'MonthlySaleReport', month?: string | null, totalAmountSales?: number | null, totalCostOfGoods?: number | null, grossProfit?: number | null, totalItemsSold?: number | null }> } | null };

export type ItemsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type ItemsQuery = { __typename?: 'Query', items: Array<{ __typename?: 'Item', id: any, name: string, pricePerUnit: number, unit: string, currentStock: number }> };

export type AddItemMutationVariables = Exact<{
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  unit: Scalars['String']['input'];
  pricePerUnit: Scalars['Float']['input'];
  currentStock: Scalars['Float']['input'];
}>;


export type AddItemMutation = { __typename?: 'Mutation', addItem: { __typename?: 'Item', id: any, name: string, unit: string, pricePerUnit: number, currentStock: number } };

export type DeleteItemMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', deleteItem: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type RecordSaleMutationVariables = Exact<{
  items: Array<SaleItemInput> | SaleItemInput;
}>;


export type RecordSaleMutation = { __typename?: 'Mutation', recordSale: { __typename?: 'SaleResponse', id: any, totalAmount: number, message: string, orderNo: string } };

export type ProductsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'Product', id: any, name: string, price: number, availableUnits: number, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', quantityUsed: number, item: { __typename?: 'Item', id: any, name: string, unit: string, pricePerUnit: number } }> }> };

export type AddProductMutationVariables = Exact<{
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  items: Array<ProductIngredientInput> | ProductIngredientInput;
}>;


export type AddProductMutation = { __typename?: 'Mutation', addProduct: { __typename?: 'Product', id: any, name: string, price: number, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', quantityUsed: number, item: { __typename?: 'Item', id: any, name: string, unit: string, pricePerUnit: number } }> } };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type SalesQueryVariables = Exact<{ [key: string]: never; }>;


export type SalesQuery = { __typename?: 'Query', sales: Array<{ __typename?: 'Sale', createdAt: string, id: any, status: string, orderNo: string, costOfGoods: number, grossProfit: number, totalAmount: number, saleItems: Array<{ __typename?: 'SaleItem', priceAtSale: number, productId: any, quantity: number, product: { __typename?: 'Product', id: any, name: string, price: number, updatedAt: string, createdAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', id: any, itemId: any, productId: any, quantityUsed: number, item: { __typename?: 'Item', name: string, id: any, currentStock: number, createdAt: string, pricePerUnit: number, unit: string, updatedAt: string } }> } }> }> };

export type VoidSaleMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  voidReason: Scalars['String']['input'];
}>;


export type VoidSaleMutation = { __typename?: 'Mutation', voidSale: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', id?: any | null, username?: string | null, role?: string | null, success: boolean, message: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };


export const MeDocument = gql`
    query Me {
  me {
    id
    username
    role
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const SaleReportDocument = gql`
    query SaleReport($startDate: String, $endDate: String, $year: String) {
  saleReport(startDate: $startDate, endDate: $endDate, year: $year) {
    totalAmountSales
    totalCostOfGoods
    grossProfit
    totalItemsSold
    totalSalesPercentage
    totalCostPercentage
    grossProfitPercentage
    availableYears
    topProductSold {
      name
      quantity
    }
    groupSales {
      month
      totalAmountSales
      totalCostOfGoods
      grossProfit
      totalItemsSold
    }
  }
}
    `;

/**
 * __useSaleReportQuery__
 *
 * To run a query within a React component, call `useSaleReportQuery` and pass it any options that fit your needs.
 * When your component renders, `useSaleReportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSaleReportQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useSaleReportQuery(baseOptions?: Apollo.QueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
      }
export function useSaleReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
        }
export function useSaleReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
        }
export type SaleReportQueryHookResult = ReturnType<typeof useSaleReportQuery>;
export type SaleReportLazyQueryHookResult = ReturnType<typeof useSaleReportLazyQuery>;
export type SaleReportSuspenseQueryHookResult = ReturnType<typeof useSaleReportSuspenseQuery>;
export type SaleReportQueryResult = Apollo.QueryResult<SaleReportQuery, SaleReportQueryVariables>;
export const ItemsDocument = gql`
    query Items($search: String) {
  items(search: $search) {
    id
    name
    pricePerUnit
    unit
    currentStock
  }
}
    `;

/**
 * __useItemsQuery__
 *
 * To run a query within a React component, call `useItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemsQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useItemsQuery(baseOptions?: Apollo.QueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
      }
export function useItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
        }
export function useItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ItemsQuery, ItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ItemsQuery, ItemsQueryVariables>(ItemsDocument, options);
        }
export type ItemsQueryHookResult = ReturnType<typeof useItemsQuery>;
export type ItemsLazyQueryHookResult = ReturnType<typeof useItemsLazyQuery>;
export type ItemsSuspenseQueryHookResult = ReturnType<typeof useItemsSuspenseQuery>;
export type ItemsQueryResult = Apollo.QueryResult<ItemsQuery, ItemsQueryVariables>;
export const AddItemDocument = gql`
    mutation AddItem($id: UUID, $name: String!, $unit: String!, $pricePerUnit: Float!, $currentStock: Float!) {
  addItem(
    id: $id
    name: $name
    unit: $unit
    pricePerUnit: $pricePerUnit
    currentStock: $currentStock
  ) {
    id
    name
    unit
    pricePerUnit
    currentStock
  }
}
    `;
export type AddItemMutationFn = Apollo.MutationFunction<AddItemMutation, AddItemMutationVariables>;

/**
 * __useAddItemMutation__
 *
 * To run a mutation, you first call `useAddItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addItemMutation, { data, loading, error }] = useAddItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      unit: // value for 'unit'
 *      pricePerUnit: // value for 'pricePerUnit'
 *      currentStock: // value for 'currentStock'
 *   },
 * });
 */
export function useAddItemMutation(baseOptions?: Apollo.MutationHookOptions<AddItemMutation, AddItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddItemMutation, AddItemMutationVariables>(AddItemDocument, options);
      }
export type AddItemMutationHookResult = ReturnType<typeof useAddItemMutation>;
export type AddItemMutationResult = Apollo.MutationResult<AddItemMutation>;
export type AddItemMutationOptions = Apollo.BaseMutationOptions<AddItemMutation, AddItemMutationVariables>;
export const DeleteItemDocument = gql`
    mutation DeleteItem($id: UUID!) {
  deleteItem(id: $id) {
    success
    message
  }
}
    `;
export type DeleteItemMutationFn = Apollo.MutationFunction<DeleteItemMutation, DeleteItemMutationVariables>;

/**
 * __useDeleteItemMutation__
 *
 * To run a mutation, you first call `useDeleteItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteItemMutation, { data, loading, error }] = useDeleteItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteItemMutation, DeleteItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, options);
      }
export type DeleteItemMutationHookResult = ReturnType<typeof useDeleteItemMutation>;
export type DeleteItemMutationResult = Apollo.MutationResult<DeleteItemMutation>;
export type DeleteItemMutationOptions = Apollo.BaseMutationOptions<DeleteItemMutation, DeleteItemMutationVariables>;
export const RecordSaleDocument = gql`
    mutation RecordSale($items: [SaleItemInput!]!) {
  recordSale(items: $items) {
    id
    totalAmount
    message
    orderNo
  }
}
    `;
export type RecordSaleMutationFn = Apollo.MutationFunction<RecordSaleMutation, RecordSaleMutationVariables>;

/**
 * __useRecordSaleMutation__
 *
 * To run a mutation, you first call `useRecordSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordSaleMutation, { data, loading, error }] = useRecordSaleMutation({
 *   variables: {
 *      items: // value for 'items'
 *   },
 * });
 */
export function useRecordSaleMutation(baseOptions?: Apollo.MutationHookOptions<RecordSaleMutation, RecordSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RecordSaleMutation, RecordSaleMutationVariables>(RecordSaleDocument, options);
      }
export type RecordSaleMutationHookResult = ReturnType<typeof useRecordSaleMutation>;
export type RecordSaleMutationResult = Apollo.MutationResult<RecordSaleMutation>;
export type RecordSaleMutationOptions = Apollo.BaseMutationOptions<RecordSaleMutation, RecordSaleMutationVariables>;
export const ProductsDocument = gql`
    query Products($search: String) {
  products(search: $search) {
    id
    name
    price
    availableUnits
    ingredientsUsed {
      item {
        id
        name
        unit
        pricePerUnit
      }
      quantityUsed
    }
  }
}
    `;

/**
 * __useProductsQuery__
 *
 * To run a query within a React component, call `useProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useProductsQuery(baseOptions?: Apollo.QueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
      }
export function useProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export function useProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export type ProductsQueryHookResult = ReturnType<typeof useProductsQuery>;
export type ProductsLazyQueryHookResult = ReturnType<typeof useProductsLazyQuery>;
export type ProductsSuspenseQueryHookResult = ReturnType<typeof useProductsSuspenseQuery>;
export type ProductsQueryResult = Apollo.QueryResult<ProductsQuery, ProductsQueryVariables>;
export const AddProductDocument = gql`
    mutation addProduct($id: UUID, $name: String!, $price: Float!, $items: [ProductIngredientInput!]!) {
  addProduct(id: $id, name: $name, price: $price, items: $items) {
    id
    name
    price
    ingredientsUsed {
      item {
        id
        name
        unit
        pricePerUnit
      }
      quantityUsed
    }
  }
}
    `;
export type AddProductMutationFn = Apollo.MutationFunction<AddProductMutation, AddProductMutationVariables>;

/**
 * __useAddProductMutation__
 *
 * To run a mutation, you first call `useAddProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProductMutation, { data, loading, error }] = useAddProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      price: // value for 'price'
 *      items: // value for 'items'
 *   },
 * });
 */
export function useAddProductMutation(baseOptions?: Apollo.MutationHookOptions<AddProductMutation, AddProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProductMutation, AddProductMutationVariables>(AddProductDocument, options);
      }
export type AddProductMutationHookResult = ReturnType<typeof useAddProductMutation>;
export type AddProductMutationResult = Apollo.MutationResult<AddProductMutation>;
export type AddProductMutationOptions = Apollo.BaseMutationOptions<AddProductMutation, AddProductMutationVariables>;
export const DeleteProductDocument = gql`
    mutation DeleteProduct($id: UUID!) {
  deleteProduct(id: $id) {
    success
    message
  }
}
    `;
export type DeleteProductMutationFn = Apollo.MutationFunction<DeleteProductMutation, DeleteProductMutationVariables>;

/**
 * __useDeleteProductMutation__
 *
 * To run a mutation, you first call `useDeleteProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProductMutation, { data, loading, error }] = useDeleteProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProductMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProductMutation, DeleteProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProductMutation, DeleteProductMutationVariables>(DeleteProductDocument, options);
      }
export type DeleteProductMutationHookResult = ReturnType<typeof useDeleteProductMutation>;
export type DeleteProductMutationResult = Apollo.MutationResult<DeleteProductMutation>;
export type DeleteProductMutationOptions = Apollo.BaseMutationOptions<DeleteProductMutation, DeleteProductMutationVariables>;
export const SalesDocument = gql`
    query Sales {
  sales {
    createdAt
    id
    status
    orderNo
    costOfGoods
    grossProfit
    saleItems {
      priceAtSale
      product {
        id
        ingredientsUsed {
          id
          item {
            name
            id
            currentStock
            createdAt
            pricePerUnit
            unit
            updatedAt
          }
          itemId
          productId
          quantityUsed
        }
        name
        price
        updatedAt
        createdAt
      }
      productId
      quantity
    }
    totalAmount
  }
}
    `;

/**
 * __useSalesQuery__
 *
 * To run a query within a React component, call `useSalesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesQuery({
 *   variables: {
 *   },
 * });
 */
export function useSalesQuery(baseOptions?: Apollo.QueryHookOptions<SalesQuery, SalesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
      }
export function useSalesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesQuery, SalesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
        }
export function useSalesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesQuery, SalesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
        }
export type SalesQueryHookResult = ReturnType<typeof useSalesQuery>;
export type SalesLazyQueryHookResult = ReturnType<typeof useSalesLazyQuery>;
export type SalesSuspenseQueryHookResult = ReturnType<typeof useSalesSuspenseQuery>;
export type SalesQueryResult = Apollo.QueryResult<SalesQuery, SalesQueryVariables>;
export const VoidSaleDocument = gql`
    mutation voidSale($id: UUID!, $voidReason: String!) {
  voidSale(id: $id, voidReason: $voidReason) {
    success
    message
  }
}
    `;
export type VoidSaleMutationFn = Apollo.MutationFunction<VoidSaleMutation, VoidSaleMutationVariables>;

/**
 * __useVoidSaleMutation__
 *
 * To run a mutation, you first call `useVoidSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVoidSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [voidSaleMutation, { data, loading, error }] = useVoidSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      voidReason: // value for 'voidReason'
 *   },
 * });
 */
export function useVoidSaleMutation(baseOptions?: Apollo.MutationHookOptions<VoidSaleMutation, VoidSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VoidSaleMutation, VoidSaleMutationVariables>(VoidSaleDocument, options);
      }
export type VoidSaleMutationHookResult = ReturnType<typeof useVoidSaleMutation>;
export type VoidSaleMutationResult = Apollo.MutationResult<VoidSaleMutation>;
export type VoidSaleMutationOptions = Apollo.BaseMutationOptions<VoidSaleMutation, VoidSaleMutationVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    id
    username
    role
    success
    message
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;