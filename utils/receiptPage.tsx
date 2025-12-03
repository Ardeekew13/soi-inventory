import { CartProduct } from "./helper";

export const generateBillHTML = (
	cart: CartProduct[],
	totalAmount: number,
	orderType: string,
	tableNumber: string | null,
	orderNumber?: string | null
) => {
	return `
    <html>
      <head>
        <title>Bill</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 24px;
            background: #fff;
            max-width: 500px;
            margin: auto;
            color: #333;
          }
          h1 {
            text-align: center;
            font-size: 26px;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .subtitle {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 24px;
            font-weight: bold;
          }
          .meta {
            margin-bottom: 20px;
            font-size: 14px;
            border-bottom: 2px dashed #ccc;
            padding-bottom: 12px;
          }
          .meta span {
            display: block;
            margin-bottom: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th, td {
            text-align: left;
            padding: 10px 0;
            font-size: 14px;
          }
          th {
            border-bottom: 2px solid #333;
            font-weight: bold;
            text-transform: uppercase;
          }
          tbody tr {
            border-bottom: 1px dashed #ddd;
          }
          .summary {
            text-align: right;
            font-size: 14px;
            border-top: 2px solid #333;
            padding-top: 12px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .total-row {
            font-size: 20px;
            font-weight: bold;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #333;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 13px;
            color: #666;
            border-top: 2px dashed #ccc;
            padding-top: 16px;
          }
          .unpaid-notice {
            text-align: center;
            margin-top: 20px;
            padding: 12px;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 4px;
            font-weight: bold;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <h1>Soi Suites</h1>
        <div class="subtitle">*** BILL ***</div>

        <div class="meta">
          ${orderNumber ? `<span><strong>Order #:</strong> ${orderNumber}</span>` : ''}
          <span><strong>Type:</strong> ${orderType === 'DINE_IN' ? 'Dine In' : 'Take Out'}</span>
          ${tableNumber ? `<span><strong>Table:</strong> ${tableNumber}</span>` : ''}
          <span><strong>Date:</strong> ${new Date().toLocaleString('en-PH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${cart
							.map(
								(item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">₱${item.price.toFixed(2)}</td>
                <td style="text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
              </tr>`
							)
							.join("")}
          </tbody>
        </table>

        <div class="summary">
          <div class="total-row">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL AMOUNT:</span>
              <span>₱${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="unpaid-notice">
          ⚠️ UNPAID - FOR CUSTOMER REFERENCE ONLY
        </div>

        <div class="footer">
          Please present this bill when making payment.<br/>
          Thank you for dining with us!
        </div>
      </body>
    </html>
  `;
};

export const generateReceiptHTML = (
	cart: CartProduct[],
	totalAmount: number,
	receiptDate: string,
	orderNumber: string
) => {
	return `
    <html>
      <head>
        <title>Order Summary</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 24px;
            background: #fff;
            max-width: 500px;
            margin: auto;
            color: #333;
          }
          h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 4px;
          }
          .subtitle {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          .meta {
            margin-bottom: 20px;
            font-size: 14px;
          }
          .meta span {
            display: block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th, td {
            text-align: left;
            padding: 8px 0;
          }
          th {
            border-bottom: 1px solid #ccc;
            font-weight: bold;
          }
          .summary {
            text-align: right;
            font-weight: bold;
            font-size: 16px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Soi Suites</h1>
        <div class="subtitle">Sales Receipt</div>

        <div class="meta">
          <span><strong>Date:</strong> ${receiptDate}</span>
          <span><strong>Transaction Number:</strong> ${orderNumber}</span>

        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart
							.map(
								(item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">₱${item.price.toLocaleString(
									"en-PH"
								)}</td>
                <td style="text-align: right;">₱${(
									item.price * item.quantity
								).toLocaleString("en-PH")}</td>
              </tr>`
							)
							.join("")}
          </tbody>
        </table>

        <div class="summary">
          Order Total: ₱${totalAmount.toLocaleString("en-PH")}
        </div>

        <div class="footer">
          Thank you for your purchase!<br/>
          Please keep this receipt for your records.<br/><br/>
          <span style="font-size: 10px; color: #999;">
            THIS IS NOT AN OFFICIAL RECEIPT<br/>
            This document is for internal record purposes only.
          </span>
        </div>
      </body>
    </html>
  `;
};
