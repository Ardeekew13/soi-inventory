import { CartProduct } from "./helper";

export const generateReceiptHTML = (
	cart: CartProduct[],
	totalAmount: number,
	receiptDate: string,
	orderNumber: string
) => {
	return `
    <html>
      <head>
        <title>Official Receipt</title>
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
        <div class="subtitle">Official Receipt</div>

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
          This serves as your official receipt.
        </div>
      </body>
    </html>
  `;
};
