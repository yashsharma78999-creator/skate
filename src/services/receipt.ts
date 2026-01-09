import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReceiptData {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

export const receiptService = {
  async generateAndDownloadPDF(data: ReceiptData) {
    try {
      const html = this.generateReceiptHTML(data);
      const element = document.createElement('div');
      element.innerHTML = html;
      element.style.display = 'none';
      element.style.width = '800px';
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      document.body.removeChild(element);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`receipt-${data.orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },

  async printReceipt(data: ReceiptData) {
    try {
      const html = this.generateReceiptHTML(data);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw error;
    }
  },

  generateReceiptHTML(data: ReceiptData): string {
    const itemsHTML = data.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; text-align: left;">${item.name}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const shippingAddressHTML = data.shippingAddress
      ? `
      <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Shipping Address</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #555;">
          ${data.shippingAddress.address}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}
        </p>
      </div>
    `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Receipt - ${data.orderNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .receipt-header h1 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 28px;
          }
          .receipt-header p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-weight: bold;
            color: #333;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            color: #555;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
          }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .status-confirmed { background-color: #d1ecf1; color: #0c5460; }
          .status-processing { background-color: #d1ecf1; color: #0c5460; }
          .status-shipped { background-color: #e2e3e5; color: #383d41; }
          .status-delivered { background-color: #d4edda; color: #155724; }
          .status-cancelled { background-color: #f8d7da; color: #721c24; }
          .payment-pending { background-color: #fff3cd; color: #856404; }
          .payment-completed { background-color: #d4edda; color: #155724; }
          .payment-failed { background-color: #f8d7da; color: #721c24; }
          .payment-refunded { background-color: #e2e3e5; color: #383d41; }
          table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
          }
          table th {
            background-color: #007bff;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .totals {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            padding: 20px 0;
            border-top: 2px solid #ddd;
            border-bottom: 2px solid #ddd;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            width: 300px;
            font-size: 14px;
          }
          .total-row.final {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .receipt-footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              background-color: white;
              padding: 0;
            }
            .receipt-container {
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h1>Order Receipt</h1>
            <p>Thank you for your order!</p>
          </div>

          <div class="order-info">
            <div class="info-item">
              <span class="info-label">Order Number</span>
              <span class="info-value">${data.orderNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Order Date</span>
              <span class="info-value">${new Date(data.orderDate).toLocaleDateString()} ${new Date(data.orderDate).toLocaleTimeString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Order Status</span>
              <span class="info-value">
                <span class="status-badge status-${data.status}">${data.status.toUpperCase()}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Status</span>
              <span class="info-value">
                <span class="status-badge payment-${data.paymentStatus}">${data.paymentStatus.toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div class="order-info">
            <div class="info-item">
              <span class="info-label">Customer Name</span>
              <span class="info-value">${data.customerName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Customer Email</span>
              <span class="info-value">${data.customerEmail}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Customer Phone</span>
              <span class="info-value">${data.customerPhone}</span>
            </div>
          </div>

          <h3 style="margin: 20px 0 10px 0; color: #333;">Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>₹${data.shipping.toFixed(2)}</span>
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>₹${data.total.toFixed(2)}</span>
            </div>
          </div>

          ${shippingAddressHTML}

          <div class="receipt-footer">
            <p>This is an automated receipt. Please keep it for your records.</p>
            <p>For any inquiries, please contact our customer support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};
