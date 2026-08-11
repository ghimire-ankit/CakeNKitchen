/**
 * Invoice / Receipt Printing Helper for CakeNKitchen
 */
export const printInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
        alert("Please allow popups to open the receipt.");
        return;
    }

    const itemsRows = (order.items || []).map((item) => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #ebedf0; text-align: left; font-size: 13.5px;">
        <strong>${item.name}</strong>
        ${item.message ? `<div style="font-size: 11px; color: #8c2f39; margin-top: 3px; font-weight: 500;">Customization: ${item.message}</div>` : ''}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #ebedf0; text-align: center; font-size: 13.5px;">${item.size || '1 lb'}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #ebedf0; text-align: center; font-weight: 700; font-size: 13.5px;">${item.qty}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #ebedf0; text-align: right; font-size: 13.5px;">NPR ${parseFloat(item.price).toLocaleString()}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #ebedf0; text-align: right; font-weight: 700; font-size: 13.5px;">NPR ${parseFloat(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

    const formattedDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const deliveryDateFormatted = order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : 'N/A';

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - Order #${order.order_id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Epilogue', Arial, sans-serif;
            color: #2d3748;
            margin: 0;
            padding: 40px;
            background-color: #f7fafc;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 50px;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #8c2f39;
            padding-bottom: 25px;
            margin-bottom: 35px;
          }
          
          .logo-area h1 {
            color: #8c2f39;
            margin: 0 0 6px 0;
            font-weight: 800;
            font-size: 32px;
            letter-spacing: -0.5px;
          }
          
          .logo-area p {
            margin: 0;
            color: #718096;
            font-size: 13.5px;
            font-weight: 500;
          }
          
          .logo-area .contact-info {
            margin-top: 8px;
            font-size: 12px;
            color: #4a5568;
            line-height: 1.4;
          }
          
          .bill-title {
            text-align: right;
          }
          
          .bill-title h2 {
            margin: 0;
            color: #1a202c;
            font-weight: 800;
            font-size: 28px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .bill-title p {
            margin: 6px 0 0 0;
            color: #8c2f39;
            font-weight: 700;
            font-size: 15px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 35px;
          }
          
          .details-block {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #edf2f7;
          }
          
          .details-block h4 {
            margin: 0 0 10px 0;
            color: #8c2f39;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
          }
          
          .details-block p {
            margin: 6px 0;
            font-size: 13.5px;
            line-height: 1.5;
            color: #4a5568;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 35px;
          }
          
          .items-table th {
            background-color: #f8fafc;
            color: #4a5568;
            font-weight: 800;
            text-align: left;
            padding: 14px 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
            border-top: 1px solid #edf2f7;
            padding-top: 20px;
          }
          
          .totals-table {
            width: 320px;
            border-collapse: collapse;
          }
          
          .totals-table td {
            padding: 8px 10px;
            font-size: 14px;
            color: #4a5568;
          }
          
          .totals-table tr.grand-total td {
            font-size: 20px;
            font-weight: 800;
            color: #8c2f39;
            border-top: 2px solid #edf2f7;
            padding-top: 14px;
          }
          
          .footer-note {
            text-align: center;
            border-top: 1px solid #edf2f7;
            padding-top: 30px;
            color: #718096;
            font-size: 12.5px;
            line-height: 1.6;
          }
          
          .footer-note p {
            margin: 4px 0;
          }
          
          .no-print-bar {
            max-width: 800px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            padding: 15px 30px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .print-btn {
            background-color: #8c2f39;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            font-family: 'Epilogue', sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(140, 47, 57, 0.2);
            transition: all 0.2s;
          }
          
          .print-btn:hover {
            background-color: #6d222b;
            transform: translateY(-1px);
          }
          
          .close-btn {
            background-color: #f7fafc;
            color: #4a5568;
            border: 1px solid #cbd5e0;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            font-family: 'Epilogue', sans-serif;
            cursor: pointer;
          }
          
          .close-btn:hover {
            background-color: #edf2f7;
          }

          @media print {
            body {
              padding: 0;
              background-color: #fff;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
              padding: 0;
              max-width: 100%;
            }
            .no-print-bar {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <span style="font-weight: 700; font-size: 15px; color: #1a202c;">📄 Receipt Ready to Print</span>
          <div style="display: flex; gap: 10px;">
            <button class="close-btn" onclick="window.close()">Close Window</button>
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
          </div>
        </div>
        <div class="invoice-card">
          <div class="header">
            <div class="logo-area">
              <h1>CakeNKitchen</h1>
              <p>Baked with love, delivered with care</p>
              <div class="contact-info">
                Kalimati, Kathmandu, Nepal<br>
                Phone: +977-9800000000 | Email: billing@cakenkitchen.com
              </div>
            </div>
            <div class="bill-title">
              <h2>Receipt</h2>
              <p>Order #${order.order_id}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="details-block">
              <h4>Customer Details:</h4>
              <p><strong>Name:</strong> ${order.customer_name || 'Valued Customer'}</p>
              <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
            </div>
            <div class="details-block">
              <h4>Order Metadata:</h4>
              <p><strong>Receipt Date:</strong> ${formattedDate}</p>
              <p><strong>Payment Mode:</strong> ${(order.payment_method || 'cod').toUpperCase()}</p>
              <p><strong>Delivery Option:</strong> ${order.delivery_type === 'pickup' ? '🏪 Store Pickup' : '🚚 Standard Shipping'}</p>
              <p><strong>Scheduled Date:</strong> ${deliveryDateFormatted} (${order.delivery_time})</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 45%;">Item Description</th>
                <th style="width: 15%; text-align: center;">Size</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 15%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td style="color: #718096; font-weight: 500;">Subtotal</td>
                <td style="text-align: right; font-weight: 700; color: #2d3748;">NPR ${parseFloat(order.total).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #718096; font-weight: 500;">Delivery Fee</td>
                <td style="text-align: right; font-weight: 700; color: #2d3748;">NPR 0</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total</td>
                <td style="text-align: right;">NPR ${parseFloat(order.total).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 20px; font-size: 11px; color: #718096; line-height: 1.5;">
            * In case of cancellations, query, or customized orders adjustments, the invoice values are subject to validation by the billing department.
          </div>
          
          <div class="footer-note">
            <p>Thank you for choosing <strong>CakeNKitchen Bakery</strong>!</p>
            <p>Terms of service apply. Enjoy your purchase and see you again soon!</p>
          </div>
        </div>
      </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
};
