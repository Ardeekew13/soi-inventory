/**
 * Example: How to integrate Offline Sync into POS
 *
 * This shows how to modify your existing POS component to work offline
 */

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useMutation } from "@apollo/client";
import { CREATE_SALE_MUTATION } from "@/graphql/inventory/point-of-sale";
import { message } from "antd";

export function POSWithOfflineSync() {
  const { isOnline, saveOffline } = useOfflineSync();
  const [createSale] = useMutation(CREATE_SALE_MUTATION);

  const handleCheckout = async (saleData: any) => {
    try {
      if (isOnline) {
        // Online: Send directly to server
        const result = await createSale({
          variables: { input: saleData },
        });

        message.success("Sale completed!");
        return result.data.createSale;
      } else {
        // Offline: Save locally
        const offlineId = await saveOffline("SALE", saleData);

        message.info("💾 Sale saved offline. Will sync when online.");

        // Return a temporary sale object for UI
        return {
          _id: offlineId,
          orderNo: `OFFLINE-${Date.now()}`,
          ...saleData,
          status: "PENDING_SYNC", // Custom status for offline
        };
      }
    } catch (error: any) {
      message.error(error.message || "Failed to process sale");
      throw error;
    }
  };

  return (
    <div>
      {/* Your POS UI here */}
      <Button onClick={() => handleCheckout(saleData)}>
        Checkout {!isOnline && "(Offline)"}
      </Button>
    </div>
  );
}

/**
 * Example: Offline-aware GraphQL wrapper
 */
export function useOfflineMutation(mutation: any, options?: any) {
  const { isOnline, saveOffline } = useOfflineSync();
  const [executeMutation, mutationResult] = useMutation(mutation, options);

  const executeWithOfflineSupport = async (
    variables: any,
    transactionType: "SALE" | "CASH_DRAWER" | "SHIFT_EVENT"
  ) => {
    if (isOnline) {
      // Online: Execute normally
      return await executeMutation({ variables });
    } else {
      // Offline: Save locally
      const offlineId = await saveOffline(transactionType, variables.input);

      // Return mock result for UI
      return {
        data: {
          [Object.keys(mutation.definitions[0].selectionSet.selections[0])[0]]:
            {
              _id: offlineId,
              ...variables.input,
              __typename: "OfflineTransaction",
            },
        },
      };
    }
  };

  return [executeWithOfflineSupport, mutationResult];
}
