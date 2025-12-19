"use client";
import CartSection from "@/component/point-of-sale/CartSection";
import KitchenReceiptModal from "@/component/point-of-sale/dialog/kitchenReceiptModal";
import ParkedOrdersDrawer from "@/component/point-of-sale/dialog/parkedOrdersDrawer";
import TableSelectionModal from "@/component/point-of-sale/dialog/tableSelectionModal";
import VoidParkedModal from "@/component/point-of-sale/dialog/voidParkedModal";
import ItemCardSection from "@/component/point-of-sale/ItemCardSection";
import OfflineSyncStatus from "@/component/common/OfflineSyncStatus";
import { OrderType, Query, Sale } from "@/generated/graphql";
import {
  CHECKOUT_SALE,
  GET_PARKED_SALES,
  PARK_SALE,
  SEND_TO_KITCHEN,
} from "@/graphql/inventory/point-of-sale";
import { GET_PRODUCTS } from "@/graphql/inventory/products";
import {
  GET_DISCOUNTS,
  GET_SERVICE_CHARGES,
} from "@/graphql/settings/settings";
import {
  GET_CURRENT_CASH_DRAWER,
  OPEN_CASH_DRAWER,
} from "@/graphql/cash-drawer/cash-drawer";
import { ME_QUERY } from "@/graphql/auth/me";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { PHP_BILLS } from "@/utils/constant";
import { CartProduct, pesoFormatter } from "@/utils/helper";
import { generateReceiptHTML, generateBillHTML } from "@/utils/receiptPage";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Alert,
} from "antd";
import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

const PointOfSale = () => {
  // Permission guard - will redirect if no access
  const { loading: permissionLoading, userPermissions } = usePermissionGuard({
    module: "pointOfSale",
    action: "view",
  });

  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  
  // Get current user data
  const { data: meData } = useQuery<Query>(ME_QUERY);
  const currentUser = meData?.me;
  
  // Offline sync hook
  const { isOnline, saveOffline } = useOfflineSync();

  const [cart, setCart] = useState<CartProduct[]>([]);
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DineIn);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [parkedDrawerOpen, setParkedDrawerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [kitchenReceiptOpen, setKitchenReceiptOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [voidingOrderNo, setVoidingOrderNo] = useState<string | null>(null);
  const [currentParkedSale, setCurrentParkedSale] = useState<Sale | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [currentParkedId, setCurrentParkedId] = useState<string | null>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(
    null
  );
  const [selectedServiceChargeId, setSelectedServiceChargeId] = useState<
    string | null
  >(null);
  const [cashDrawerModalOpen, setCashDrawerModalOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [offlineParkedSales, setOfflineParkedSales] = useState<any[]>([]);

  const { data, loading, refetch } = useQuery<Query>(GET_PRODUCTS, {
    variables: { search, limit: 100 },
    skip: permissionLoading,
  });

  const {
    data: parkedData,
    loading: parkedLoading,
    refetch: refetchParked,
  } = useQuery<Query>(GET_PARKED_SALES, {
    skip: permissionLoading,
  });

  const { data: discountsData } = useQuery(GET_DISCOUNTS, {
    skip: permissionLoading,
  });
  const { data: serviceChargesData } = useQuery(GET_SERVICE_CHARGES, {
    skip: permissionLoading,
  });

  const { data: cashDrawerData, refetch: refetchCashDrawer } = useQuery(
    GET_CURRENT_CASH_DRAWER,
    {
      skip: permissionLoading,
    }
  );

  // Load offline parked sales from localStorage
  useEffect(() => {
    const loadOfflineParkedSales = () => {
      try {
        const stored = localStorage.getItem('offline_parked_sales');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the parsed data is an array
          if (Array.isArray(parsed)) {
            setOfflineParkedSales(parsed);
          } else {
            console.warn('Invalid offline parked sales data, resetting...');
            localStorage.removeItem('offline_parked_sales');
          }
        }
      } catch (error) {
        console.error('Failed to load offline parked sales:', error);
        // Clear corrupted data
        localStorage.removeItem('offline_parked_sales');
      }
    };

    loadOfflineParkedSales();
  }, []);

  // Cleanup synced offline sales when coming back online
  useEffect(() => {
    if (isOnline && offlineParkedSales.length > 0) {
      // After a short delay, refetch parked sales to get synced data
      const timer = setTimeout(() => {
        refetchParked().then(() => {
          // Clear offline parked sales as they should be synced
          setOfflineParkedSales([]);
          localStorage.removeItem('offline_parked_sales');
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineParkedSales.length, refetchParked]);

  // Handle cash drawer modal opening
  useEffect(() => {
    if (cashDrawerData !== undefined && !cashDrawerData?.currentCashDrawer) {
      setCashDrawerModalOpen(true);
    }
  }, [cashDrawerData]);

  const [openCashDrawer, { loading: openDrawerLoading }] = useMutation(
    OPEN_CASH_DRAWER,
    {
      onCompleted: (data) => {
        if (data?.openCashDrawer?.success) {
          messageApi.success(data.openCashDrawer.message);
          setCashDrawerModalOpen(false);
          setOpeningBalance(0);
          refetchCashDrawer();
        }
      },
      onError: (error) => messageApi.error(error.message),
    }
  );

  const [parkSale, { loading: parkLoading }] = useMutation(PARK_SALE, {
    onCompleted: async (data) => {
      if (data?.parkSale?.success) {
        messageApi.success(data.parkSale.message);
        setCurrentParkedId(data.parkSale.data._id);

        // Refetch parked sales and show kitchen receipt
        const { data: newData } = await refetchParked();
        const parkedSale = newData?.parkedSales.find(
          (sale: Sale) => sale._id === data.parkSale.data._id
        );

        if (parkedSale) {
          setCurrentParkedSale(parkedSale);
          setKitchenReceiptOpen(true);
        }
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [sendToKitchen] = useMutation(SEND_TO_KITCHEN, {
    onCompleted: async (data) => {
      if (data?.sendToKitchen?.success) {
        messageApi.success(data.sendToKitchen.message);

        // Refetch and update currentParkedSale to show updated quantityPrinted
        const { data: newData } = await refetchParked();
        if (currentParkedId && newData?.parkedSales) {
          const updatedSale = newData.parkedSales.find(
            (sale: Sale) => sale._id === currentParkedId
          );
          if (updatedSale) {
            setCurrentParkedSale(updatedSale);
          }
        }
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [checkoutSale, { loading: checkoutLoading }] = useMutation(
    CHECKOUT_SALE,
    {
      onCompleted: (data) => {
        if (data?.checkoutSale?.success) {
          const saleData = data.checkoutSale.data;
          messageApi.success(data.checkoutSale.message);

          // Print receipt
          if (saleData.orderNo) {
            const receiptDate = dayjs().format("MMMM D, YYYY h:mm A");
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              printWindow.document.write(
                generateReceiptHTML(
                  cart,
                  totalAmount,
                  receiptDate,
                  saleData.orderNo
                )
              );
              printWindow.document.close();
              printWindow.print();
            }
          }

          // Clear cart and close modal
          handleClearCart();
          setPaymentModalOpen(false);
          setAmountPaid(0);
          setPaymentMethod("CASH");
          refetchParked();
          refetch();
          refetchCashDrawer(); // Refetch cash drawer to update balance
        }
      },
      onError: (error) => {
        messageApi.error(error.message);
        setPaymentModalOpen(false);
        setPaymentMethod("CASH");
      },
    }
  );

  // Memoized data extractions for performance
  const products = useMemo(() => data?.productsList?.products || [], [data?.productsList?.products]);
  const onlineParkedSales = useMemo(() => parkedData?.parkedSales || [], [parkedData?.parkedSales]);
  const discounts = useMemo(() => discountsData?.discounts || [], [discountsData?.discounts]);
  const serviceCharges = useMemo(() => serviceChargesData?.serviceCharges || [], [serviceChargesData?.serviceCharges]);
  
  // Merge online and offline parked sales (memoized)
  const parkedSales = useMemo(() => 
    [...onlineParkedSales, ...offlineParkedSales],
    [onlineParkedSales, offlineParkedSales]
  );

  const hasCashDrawer = useMemo(() => 
    !!cashDrawerData?.currentCashDrawer,
    [cashDrawerData?.currentCashDrawer]
  );

  // Memoized calculations for cart totals
  const { subtotal, discountAmount, serviceChargeAmount, totalAmount } = useMemo(() => {
    const selectedDiscount = discounts.find((d: any) => d._id === selectedDiscountId);
    const selectedServiceCharge = serviceCharges.find((sc: any) => sc._id === selectedServiceChargeId);

    // Calculate subtotal (cart items)
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Calculate discount amount
    const discountAmount = selectedDiscount ? (subtotal * selectedDiscount.value) / 100 : 0;

    // Calculate amount after discount
    const amountAfterDiscount = subtotal - discountAmount;

    // Calculate service charge amount (applied to amount after discount)
    const serviceChargeAmount = selectedServiceCharge 
      ? (amountAfterDiscount * selectedServiceCharge.value) / 100 
      : 0;

    // Final total amount
    const totalAmount = amountAfterDiscount + serviceChargeAmount;

    return { subtotal, discountAmount, serviceChargeAmount, totalAmount };
  }, [cart, selectedDiscountId, selectedServiceChargeId, discounts, serviceCharges]);

  const change = useMemo(() => amountPaid - totalAmount, [amountPaid, totalAmount]);

  const selectedDiscount = useMemo(() => 
    discounts.find((d: any) => d._id === selectedDiscountId),
    [discounts, selectedDiscountId]
  );
  
  const selectedServiceCharge = useMemo(() => 
    serviceCharges.find((sc: any) => sc._id === selectedServiceChargeId),
    [serviceCharges, selectedServiceChargeId]
  );

  // Memoized handlers for better performance
  const handleClearCart = useCallback(() => {
    setCart([]);
    setCurrentParkedId(null);
    setOrderType(OrderType.TakeOut);
    setTableNumber(null);
    setSelectedDiscountId(null);
    setSelectedServiceChargeId(null);
  }, []);

  const handleOrderTypeChange = useCallback((value: string | number) => {
    const newOrderType = value as OrderType;
    setOrderType(newOrderType);

    if (newOrderType === OrderType.DineIn) {
      setTableModalOpen(true);
    } else {
      setTableNumber(null);
    }
  }, []);

  const handleSelectTable = useCallback((table: string) => {
    setTableNumber(table);
  }, []);

  const handleSendToKitchen = useCallback(async (itemIds: string[]) => {
    if (!currentParkedSale) return;

    try {
      await sendToKitchen({
        variables: {
          saleId: currentParkedSale._id,
          itemIds,
        },
      });
    } catch (error: any) {
      console.error('Failed to send to kitchen:', error);
      messageApi.error(error.message || 'Failed to send items to kitchen');
    }
  }, [currentParkedSale, sendToKitchen, messageApi]);

  const handlePark = useCallback(async () => {
    // Validation checks
    if (!hasCashDrawer) {
      messageApi.error("Please open cash drawer first");
      setCashDrawerModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      messageApi.warning("Cart is empty");
      return;
    }

    if (orderType === OrderType.DineIn && !tableNumber) {
      messageApi.warning("Please select a table for dine-in");
      setTableModalOpen(true);
      return;
    }

    const items = cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    const parkInput = {
      id: currentParkedId,
      items,
      orderType,
      tableNumber: orderType === OrderType.DineIn ? tableNumber : null,
    };

    try {
      if (isOnline) {
        // Online: Send to server immediately
        await parkSale({
          variables: parkInput,
        });
      } else {
        // Offline: Save locally for later sync
        await saveOffline('PARKED_SALE', parkInput);
        
        // Create offline parked sale for local state with unique ID to prevent conflicts
        const cashierId = currentUser?._id?.slice(-4) || '0000';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const offlineOrderNo = `PARK-${cashierId}-${Date.now()}-${random}`;
        
        const offlineParkedSale = {
          _id: `offline-${Date.now()}-${random}`,
          totalAmount,
          orderNo: offlineOrderNo,
          orderType,
          tableNumber: orderType === OrderType.DineIn ? tableNumber : null,
          items: cart.map((item) => ({
            _id: item._id,
            productId: item._id,
            quantity: item.quantity,
            productName: item.name,
            productPrice: item.price,
          })),
          status: 'PARKED',
          costOfGoods: 0,
          grossProfit: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cashierId: currentUser?._id,
          cashierName: currentUser?.username,
        } as any;

        // Save to localStorage with error handling
        try {
          const updatedOfflineParkedSales = [...offlineParkedSales, offlineParkedSale];
          setOfflineParkedSales(updatedOfflineParkedSales);
          localStorage.setItem('offline_parked_sales', JSON.stringify(updatedOfflineParkedSales));

          // Add to local parked sales
          setCurrentParkedId(offlineParkedSale._id);
          setCurrentParkedSale(offlineParkedSale);
          
          // Show kitchen receipt
          setKitchenReceiptOpen(true);
          
          messageApi.info("💾 Order parked offline. Will sync when online.");
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError);
          messageApi.error('Failed to save offline. Storage may be full.');
        }
      }
    } catch (error: any) {
      console.error('Park order error:', error);
      messageApi.error(error.message || "Failed to park order");
    }
  }, [
    hasCashDrawer, 
    cart, 
    orderType, 
    tableNumber, 
    currentParkedId, 
    isOnline, 
    parkSale, 
    saveOffline, 
    currentUser, 
    totalAmount, 
    offlineParkedSales, 
    messageApi
  ]);

  const handleOpenPayment = useCallback(() => {
    // Validation checks
    if (!hasCashDrawer) {
      messageApi.error("Please open cash drawer first");
      setCashDrawerModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      messageApi.warning("Cart is empty");
      return;
    }

    if (orderType === OrderType.DineIn && !tableNumber) {
      messageApi.warning("Please select a table for dine-in");
      setTableModalOpen(true);
      return;
    }

    setPaymentModalOpen(true);
    setAmountPaid(0);
  }, [hasCashDrawer, cart.length, orderType, tableNumber, messageApi]);

  const handleCheckout = useCallback(async () => {
    // Validation checks
    if (!hasCashDrawer) {
      messageApi.error("Please open cash drawer first");
      setCashDrawerModalOpen(true);
      setPaymentModalOpen(false);
      return;
    }

    if (amountPaid < totalAmount) {
      messageApi.error("Payment amount is insufficient");
      return;
    }

    const items = cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    const saleInput = {
      id: currentParkedId,
      items,
      orderType,
      tableNumber: orderType === OrderType.DineIn ? tableNumber : null,
      paymentMethod,
    };

    try {
      if (isOnline) {
        // Online: Send to server immediately
        await checkoutSale({
          variables: saleInput,
        });
      } else {
        // Offline: Save locally for later sync
        await saveOffline('SALE', saleInput);
        
        // Simulate successful checkout for UI
        const offlineOrderNo = `OFFLINE-${Date.now()}`;
        const receiptDate = dayjs().format("MMMM D, YYYY h:mm A");
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(
            generateReceiptHTML(
              cart,
              totalAmount,
              receiptDate,
              offlineOrderNo
            )
          );
          printWindow.document.close();
          printWindow.print();
        }
        
        // Clear cart and close modal
        handleClearCart();
        setPaymentModalOpen(false);
        setAmountPaid(0);
        setPaymentMethod("CASH");
        
        messageApi.info("💾 Sale saved offline. Will sync when online.");
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      messageApi.error(error.message || "Failed to process checkout");
    }
  }, [
    hasCashDrawer,
    amountPaid,
    totalAmount,
    cart,
    currentParkedId,
    orderType,
    tableNumber,
    paymentMethod,
    isOnline,
    checkoutSale,
    saveOffline,
    handleClearCart,
    messageApi
  ]);

  const handleAddBill = useCallback((billValue: number) => {
    setAmountPaid((prev) => prev + billValue);
  }, []);

  const handleLoadParked = useCallback((parked: Sale) => {
    // Convert parked sale items to cart products
    const cartItems: CartProduct[] = parked.saleItems?.map((item: any) => ({
      ...item.product,
      quantity: item.quantity,
      quantityPrinted: item.quantityPrinted || 0, // Preserve quantityPrinted
    })) as CartProduct[];

    setCart(cartItems);
    setOrderType(parked.orderType as OrderType);
    setTableNumber(parked?.tableNumber ?? "");
    setCurrentParkedId(parked._id);
    setParkedDrawerOpen(false);
    messageApi.success("Parked order loaded");
  }, [messageApi]);

  const handleDeleteParked = useCallback((id: string, orderNo: string) => {
    setVoidingSaleId(id);
    setVoidingOrderNo(orderNo);
    setVoidModalOpen(true);
  }, []);

  const handleVoidSuccess = useCallback(() => {
    refetchParked();
    setVoidModalOpen(false);
    setVoidingSaleId(null);
    setVoidingOrderNo(null);
  }, [refetchParked]);

  const handleOpenCashDrawer = useCallback(async () => {
    if (openingBalance < 0) {
      messageApi.error("Opening balance must be at least 0");
      return;
    }

    try {
      await openCashDrawer({
        variables: {
          openingBalance,
        },
      });
    } catch (error: any) {
      console.error('Failed to open cash drawer:', error);
      messageApi.error(error.message || 'Failed to open cash drawer');
    }
  }, [openingBalance, openCashDrawer, messageApi]);

  const handlePrintBill = useCallback(() => {
    if (cart.length === 0) {
      messageApi.warning("Cart is empty");
      return;
    }

    if (orderType === OrderType.DineIn && !tableNumber) {
      messageApi.warning("Please select a table for dine-in");
      setTableModalOpen(true);
      return;
    }

    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(
          generateBillHTML(
            cart,
            totalAmount,
            orderType,
            tableNumber,
            currentParkedId
              ? parkedSales.find((s: Sale) => s._id === currentParkedId)?.orderNo
              : null
          )
        );
        printWindow.document.close();
        printWindow.print();
      } else {
        messageApi.error("Failed to open print window. Please check your popup blocker.");
      }
    } catch (error) {
      console.error('Print error:', error);
      messageApi.error("Failed to print bill");
    }
  }, [cart, orderType, tableNumber, totalAmount, currentParkedId, parkedSales, messageApi]);

  // Keyboard shortcuts for common actions (F2=Park, F3=Pay, F4=Parked Orders, ESC=Clear)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        paymentModalOpen ||
        tableModalOpen ||
        parkedDrawerOpen
      ) {
        return;
      }

      // F2 - Park order
      if (e.key === 'F2') {
        e.preventDefault();
        handlePark();
      }
      // F3 - Open payment
      else if (e.key === 'F3') {
        e.preventDefault();
        handleOpenPayment();
      }
      // F4 - Show parked orders
      else if (e.key === 'F4') {
        e.preventDefault();
        setParkedDrawerOpen(true);
      }
      // ESC - Clear cart (with confirmation)
      else if (e.key === 'Escape' && cart.length > 0) {
        e.preventDefault();
        Modal.confirm({
          title: 'Clear Cart?',
          content: 'Are you sure you want to clear all items from the cart?',
          okText: 'Yes, Clear',
          cancelText: 'Cancel',
          okType: 'danger',
          onOk: handleClearCart,
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length, paymentModalOpen, tableModalOpen, parkedDrawerOpen, handlePark, handleOpenPayment, handleClearCart]);

  return (
    <div
      style={{
        padding: 20,
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      {contextHolder}

      {/* Offline Sync Status - Inline */}
      <div style={{ marginBottom: 12 }}>
        <OfflineSyncStatus showInline />
      </div>

      {/* Keyboard Shortcuts Hint */}
      <Alert
        message={
          <span style={{ fontSize: 12 }}>
            ⌨️ <strong>Shortcuts:</strong> F2=Park | F3=Pay | F4=Parked Orders | ESC=Clear Cart
          </span>
        }
        type="info"
        style={{ marginBottom: 12 }}
        closable
      />

      {/* Cash Drawer Status Alert */}
      {hasCashDrawer && (
        <Alert
          message={
            <Flex justify="space-between" align="center">
              <span>
                <strong>Cash Drawer Open</strong> - Current Balance:{" "}
                <strong style={{ color: "#52c41a" }}>
                  ₱
                  {cashDrawerData?.currentCashDrawer?.currentBalance?.toLocaleString() ||
                    "0.00"}
                </strong>
              </span>
              <Button size="small" onClick={() => router.push("/cash-drawer")}>
                Manage Drawer
              </Button>
            </Flex>
          }
          type="success"
          style={{ marginBottom: 12 }}
          closable
        />
      )}

      <Row gutter={8} style={{ height: "100%" }}>
        <Col lg={15} sm={24} style={{ height: "85vh" }}>
          <ItemCardSection
            products={products}
            loading={loading}
            refetch={refetch}
            messageApi={messageApi}
            cart={cart}
            setCart={setCart}
            search={search}
            setSearch={setSearch}
            parkedOrdersCount={parkedSales.length}
            onOpenParkedOrders={() => setParkedDrawerOpen(true)}
          />
        </Col>

        <Col lg={9} sm={24} style={{ height: "85vh" }}>
          <CartSection
            cart={cart}
            setCart={setCart}
            messageApi={messageApi}
            orderType={orderType}
            tableNumber={tableNumber}
            currentParkedOrderNo={
              currentParkedId
                ? parkedSales.find((s: Sale) => s._id === currentParkedId)
                    ?.orderNo || "Editing Order"
                : null
            }
            totalAmount={totalAmount}
            parkLoading={parkLoading}
            currentParkedId={currentParkedId}
            onClearCart={handleClearCart}
            onOrderTypeChange={handleOrderTypeChange}
            onSelectTable={() => setTableModalOpen(true)}
            onPark={handlePark}
            onOpenPayment={handleOpenPayment}
            onPrintBill={handlePrintBill}
          />
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            {paymentMethod === "CASH" && "💵 Cash Payment"}
            {paymentMethod === "BANK_TRANSFER" && "🏦 Bank Transfer Payment"}
            {paymentMethod === "CARD" && "💳 Card Payment"}
            {paymentMethod === "CREDIT" && "📝 Credit Payment"}
            {paymentMethod === "GCASH" && "📱 GCash Payment"}
          </Typography.Title>
        }
        open={paymentModalOpen}
        onCancel={() => {
          setPaymentModalOpen(false);
          setAmountPaid(0);
          setSelectedDiscountId(null);
          setSelectedServiceChargeId(null);
          setPaymentMethod("CASH");
        }}
        width={800}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              onClick={() => {
                setPaymentModalOpen(false);
                setAmountPaid(0);
                setSelectedDiscountId(null);
                setSelectedServiceChargeId(null);
                setPaymentMethod("CASH");
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckout}
              loading={checkoutLoading}
              disabled={amountPaid < totalAmount}
            >
              Complete Payment
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {/* Payment Method Selection */}
          <div>
            <Typography.Text strong>Payment Method:</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value)}
              options={[
                { label: "💵 Cash", value: "CASH" },
                { label: "🏦 Bank Transfer", value: "BANK_TRANSFER" },
                { label: "💳 Card", value: "CARD" },
                { label: "📝 Credit", value: "CREDIT" },
                { label: "📱 GCash", value: "GCASH" },
              ]}
            />
          </div>

          <Divider style={{ margin: "4px 0" }} />

          {/* Discount and Service Charge Selection - One Row */}
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text strong>Discount (Optional):</Typography.Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select discount"
                allowClear
                value={selectedDiscountId}
                onChange={(value) => setSelectedDiscountId(value || null)}
                options={discounts.map((discount: any) => ({
                  label: `${discount.title} (${discount.value}%)`,
                  value: discount._id,
                }))}
              />
            </Col>
            <Col span={12}>
              <Typography.Text strong>
                Service Charge (Optional):
              </Typography.Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select service charge"
                allowClear
                value={selectedServiceChargeId}
                onChange={(value) => setSelectedServiceChargeId(value || null)}
                options={serviceCharges.map((sc: any) => ({
                  label: `${sc.title} (${sc.value}%)`,
                  value: sc._id,
                }))}
              />
            </Col>
          </Row>

          <Divider style={{ margin: "4px 0" }} />

          {/* Amount Breakdown */}
          <Card
            size="small"
            style={{ backgroundColor: "#f5f5f5", marginBottom: 0 }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={6}>
              <Flex justify="space-between">
                <Typography.Text>Subtotal:</Typography.Text>
                <Typography.Text strong>
                  {pesoFormatter(subtotal)}
                </Typography.Text>
              </Flex>
              {selectedDiscount && (
                <Flex justify="space-between">
                  <Typography.Text type="success">
                    Discount ({selectedDiscount.value}%):
                  </Typography.Text>
                  <Typography.Text type="success" strong>
                    -{pesoFormatter(discountAmount)}
                  </Typography.Text>
                </Flex>
              )}
              {selectedServiceCharge && (
                <Flex justify="space-between">
                  <Typography.Text type="warning">
                    Service Charge ({selectedServiceCharge.value}%):
                  </Typography.Text>
                  <Typography.Text type="warning" strong>
                    +{pesoFormatter(serviceChargeAmount)}
                  </Typography.Text>
                </Flex>
              )}
              <Divider style={{ margin: "6px 0" }} />
              <Flex justify="space-between">
                <Typography.Text strong style={{ fontSize: 16 }}>
                  Total Amount:
                </Typography.Text>
                <Typography.Text
                  strong
                  style={{ fontSize: 18, color: "#ff4d4f" }}
                >
                  {pesoFormatter(totalAmount)}
                </Typography.Text>
              </Flex>
            </Space>
          </Card>

          {/* Amount Paid Input */}
          <div>
            <Typography.Text strong>Amount Paid:</Typography.Text>
            <InputNumber
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              value={amountPaid}
              onChange={(value) => setAmountPaid(value || 0)}
              min={0}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
            />
          </div>

          {/* Quick Bill Buttons */}
          <div>
            <Typography.Text strong>Quick Add Bills:</Typography.Text>
            <Row gutter={[6, 6]} style={{ marginTop: 8 }}>
              {PHP_BILLS.map((bill) => (
                <Col span={8} key={bill.value}>
                  <Button
                    size="small"
                    block
                    style={{
                      backgroundColor: bill.color,
                      color: bill.textColor,
                      borderColor: bill.color,
                      fontWeight: "bold",
                      height: 36,
                      padding: "4px 8px",
                      fontSize: 13,
                    }}
                    onClick={() => handleAddBill(bill.value)}
                  >
                    {bill.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </div>

          {/* Clear Payment */}
          <Button
            block
            size="small"
            onClick={() => setAmountPaid(0)}
            disabled={amountPaid === 0}
          >
            Clear Amount
          </Button>

          {/* Change */}
          {amountPaid > 0 && (
            <Card
              size="small"
              style={{
                backgroundColor: change >= 0 ? "#f6ffed" : "#fff1f0",
                borderColor: change >= 0 ? "#b7eb8f" : "#ffa39e",
                marginBottom: 0,
              }}
              styles={{ body: { padding: "6px 12px" } }}
            >
              <Flex justify="space-between" align="center">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  Change:
                </Typography.Text>
                <Typography.Text
                  strong
                  style={{ fontSize: 16 }}
                  type={change >= 0 ? "success" : "danger"}
                >
                  {pesoFormatter(change)}
                </Typography.Text>
              </Flex>
              {change < 0 && (
                <Typography.Text type="danger" style={{ fontSize: 11 }}>
                  Insufficient: {pesoFormatter(Math.abs(change))} needed
                </Typography.Text>
              )}
            </Card>
          )}
        </Space>
      </Modal>

      {/* Parked Orders Drawer */}
      <ParkedOrdersDrawer
        open={parkedDrawerOpen}
        onClose={() => setParkedDrawerOpen(false)}
        parkedSales={parkedSales}
        onLoadParked={handleLoadParked}
        onVoidParked={(id) => {
          const parked = parkedSales.find((s: Sale) => s._id === id);
          if (parked) {
            handleDeleteParked(id, parked.orderNo || "");
          }
        }}
      />

      {/* Void Parked Order Modal */}
      <VoidParkedModal
        open={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        saleId={voidingSaleId}
        orderNo={voidingOrderNo}
        onVoidSuccess={handleVoidSuccess}
      />

      {/* Table Selection Modal */}
      <TableSelectionModal
        open={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        onSelectTable={handleSelectTable}
        selectedTable={tableNumber}
        occupiedTables={parkedSales
          .filter(
            (sale: Sale) =>
              sale.orderType === "DINE_IN" &&
              sale.tableNumber &&
              sale._id !== currentParkedId
          )
          .map((sale: Sale) => sale.tableNumber!)}
      />

      {/* Kitchen Receipt Modal */}
      {currentParkedSale && (
        <KitchenReceiptModal
          open={kitchenReceiptOpen}
          onClose={() => {
            setKitchenReceiptOpen(false);
            setCurrentParkedSale(null);
            // Clear cart and reset state for new order
            handleClearCart();
            setCurrentParkedId(null);
          }}
          orderNo={currentParkedSale.orderNo || ""}
          orderType={currentParkedSale.orderType || ""}
          tableNumber={currentParkedSale.tableNumber || ""}
          items={currentParkedSale.saleItems?.map((item: any) => ({
            _id: item._id,
            quantity: item.quantity,
            quantityPrinted: item.quantityPrinted || 0,
            product: {
              name: item.product.name,
              price: item.product.price,
            },
          }))}
          onSendToKitchen={handleSendToKitchen}
          onPrintReceipt={() => {
            // Print logic is handled inside the modal
          }}
        />
      )}

      {/* Cash Drawer Required Modal */}
      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
            Cash Drawer Required
          </Typography.Title>
        }
        open={cashDrawerModalOpen}
        closable={false}
        maskClosable={false}
        footer={null}
        width={500}
        afterOpenChange={(open) => {
          if (open) {
            refetchCashDrawer(); // Refetch when modal opens
          }
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          <Typography.Text>
            You must open a cash drawer before you can process sales. Please
            enter the opening balance to start your shift.
          </Typography.Text>

          <div>
            <Typography.Text strong>Opening Balance:</Typography.Text>
            <InputNumber
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              value={openingBalance}
              onChange={(value) => setOpeningBalance(value || 0)}
              min={0}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
              placeholder="Enter opening cash amount"
            />
          </div>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Note: You will not be able to park orders or process payments until
            a cash drawer is opened.
          </Typography.Text>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleOpenCashDrawer}
            loading={openDrawerLoading}
          >
            Open Cash Drawer
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default PointOfSale;
