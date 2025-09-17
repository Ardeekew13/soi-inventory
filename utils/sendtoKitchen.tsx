import { Cart } from "./carts";

export const generateKitchenDocketHTML = (
	cart: Cart,
	tableNo: number | null,
	orderNumber: string,
	printedAt: string
) => {
	return `
    <html>
      <head>
        <title>Kitchen Docket</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 24px;
            background: #fff;
            max-width: 500px;
            margin: auto;
            color: #000;
          }
          h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 4px;
          }
          .subtitle {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
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
            margin-bottom: 20px;
          }
          th, td {
            text-align: left;
            padding: 10px 0;
            font-size: 16px;
          }
          th {
            border-bottom: 1px solid #000;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <h1>Soi Suites</h1>
        <div class="subtitle">Kitchen Order</div>

        <div class="meta">
          <span><strong>Table No:</strong> ${tableNo ?? "N/A"}</span>
          <span><strong>Order #:</strong> ${orderNumber}</span>
          <span><strong>Printed At:</strong> ${printedAt}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${cart?.saleItems
							.map(
								(item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right;">${item.quantity}</td>
              </tr>`
							)
							.join("")}
          </tbody>
        </table>

        <div class="footer">
          Please prepare immediately.
        </div>
      </body>
    </html>
  `;
};
