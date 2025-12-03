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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PointOfSale = () => {
  // Permission guard - will redirect if no access
  const { loading: permissionLoading, userPermissions } = usePermissionGuard({
    module: "pointOfSale",
    action: "view",
  });

  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  
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

  const products = data?.productsList?.products || [];
  const parkedSales = parkedData?.parkedSales || [];

  const discounts = discountsData?.discounts || [];
  const serviceCharges = serviceChargesData?.serviceCharges || [];

  const hasCashDrawer = !!cashDrawerData?.currentCashDrawer;

  const selectedDiscount = discounts.find(
    (d: any) => d._id === selectedDiscountId
  );
  const selectedServiceCharge = serviceCharges.find(
    (sc: any) => sc._id === selectedServiceChargeId
  );

  // Calculate subtotal (cart items)
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate discount amount
  const discountAmount = selectedDiscount
    ? (subtotal * selectedDiscount.value) / 100
    : 0;

  // Calculate amount after discount
  const amountAfterDiscount = subtotal - discountAmount;

  // Calculate service charge amount (applied to amount after discount)
  const serviceChargeAmount = selectedServiceCharge
    ? (amountAfterDiscount * selectedServiceCharge.value) / 100
    : 0;

  // Final total amount
  const totalAmount = amountAfterDiscount + serviceChargeAmount;

  const change = amountPaid - totalAmount;

  const handleClearCart = () => {
    setCart([]);
    setCurrentParkedId(null);
    setOrderType(OrderType.TakeOut);
    setTableNumber(null);
    setSelectedDiscountId(null);
    setSelectedServiceChargeId(null);
  };

  const handleOrderTypeChange = (value: string | number) => {
    const newOrderType = value as OrderType;
    setOrderType(newOrderType);

    if (newOrderType === OrderType.DineIn) {
      setTableModalOpen(true);
    } else {
      setTableNumber(null);
    }
  };

  const handleSelectTable = (table: string) => {
    setTableNumber(table);
  };

  const handleSendToKitchen = async (itemIds: string[]) => {
    if (!currentParkedSale) return;

    await sendToKitchen({
      variables: {
        saleId: currentParkedSale._id,
        itemIds,
      },
    });
  };

  const handlePark = async () => {
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

    await parkSale({
      variables: {
        id: currentParkedId,
        items,
        orderType,
        tableNumber: orderType === OrderType.DineIn ? tableNumber : null,
      },
    });
  };

  const handleOpenPayment = () => {
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
  };

  const handleCheckout = async () => {
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
        
        messageApi.info("💾 Sale saved offline. Will sync when online.");
      }
    } catch (error: any) {
      messageApi.error(error.message || "Failed to process checkout");
    }
  };

  const handleAddBill = (billValue: number) => {
    setAmountPaid((prev) => prev + billValue);
  };

  const handleLoadParked = (parked: Sale) => {
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
  };

  const handleDeleteParked = (id: string, orderNo: string) => {
    setVoidingSaleId(id);
    setVoidingOrderNo(orderNo);
    setVoidModalOpen(true);
  };

  const handleVoidSuccess = () => {
    refetchParked();
    setVoidModalOpen(false);
    setVoidingSaleId(null);
    setVoidingOrderNo(null);
  };

  const handleOpenCashDrawer = async () => {
    if (openingBalance < 0) {
      messageApi.error("Opening balance must be at least 0");
      return;
    }

    await openCashDrawer({
      variables: {
        openingBalance,
      },
    });
  };

  const handlePrintBill = () => {
    if (cart.length === 0) {
      messageApi.warning("Cart is empty");
      return;
    }

    if (orderType === OrderType.DineIn && !tableNumber) {
      messageApi.warning("Please select a table for dine-in");
      setTableModalOpen(true);
      return;
    }

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
    }
  };

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
