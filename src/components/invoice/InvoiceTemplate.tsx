"use client";

import React, { useEffect, useState } from "react";
import { type EntryFormValues } from "@/types";
import { Button } from "@/components/ui/button";

// Helper function to convert number to words (Indian system)
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));

  let str = '';
  const crore = Math.floor(num / 10000000);
  num -= crore * 10000000;
  const lakh = Math.floor(num / 100000);
  num -= lakh * 100000;
  const thousand = Math.floor(num / 1000);
  num -= thousand * 1000;
  const hundred = Math.floor(num / 100);
  num -= hundred * 100;
  
  if (crore > 0) {
    str += (crore > 19 ? b[Math.floor(crore / 10)] + ' ' + a[crore % 10] : a[crore]) + 'Crore ';
  }
  if (lakh > 0) {
    str += (lakh > 19 ? b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10] : a[lakh]) + 'Lakh ';
  }
  if (thousand > 0) {
    str += (thousand > 19 ? b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10] : a[thousand]) + 'Thousand ';
  }
  if (hundred > 0) {
    str += (hundred > 19 ? b[Math.floor(hundred / 10)] + ' ' + a[hundred % 10] : a[hundred]) + 'Hundred ';
  }
  if (num > 0) {
    if (str !== '') str += 'and ';
    str += (num < 20) ? a[num] : b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }
  return str.trim() + ' Only';
}

export function InvoiceTemplate({ data }: { data: EntryFormValues }) {
  const [mounted, setMounted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    
    setCurrentDate(dateStr);
    
    setOrderId(`OD${Date.now()}`);
    if (data.invoiceNumber) {
      setInvoiceNo(data.invoiceNumber);
    } else {
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      setInvoiceNo(`VMC/26-27/${randomSuffix}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  // Calculations
  const qty = data.quantity || 1;
  const inclusiveRate = data.rate || 0;
  
  const isSale = data.entryType === "Sale" || data.gstType !== undefined;
  
  let taxableRate = inclusiveRate;
  const gstPercent = isSale ? 5 : 0;
  
  if (isSale) {
    taxableRate = inclusiveRate / 1.05;
  }
  
  const taxableValue = qty * taxableRate;
  const totalItemAmount = qty * inclusiveRate;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (isSale) {
    if (data.gstType === "Intra-state") {
      cgst = taxableValue * 0.025;
      sgst = taxableValue * 0.025;
    } else {
      igst = taxableValue * 0.05;
    }
  }

  const totalTax = cgst + sgst + igst;
  const courierCharge = data.delivery === "Courier" ? (data.customerCourierCharge || 0) : 0;
  const totalAmount = totalItemAmount + courierCharge;
  const totalTaxableValue = taxableValue + courierCharge;

  const qrUrl = `/vanameya-upi-qr.jpeg`;
  const amountInWords = numberToWords(Math.round(totalAmount));

  // Determine addresses
  const billingAddress = data.address || "N/A";
  const shippingAddress = (!data.sameAsBilling && data.shippingAddress) ? data.shippingAddress : billingAddress;
  const customerName = data.customerName || "Cash Customer";
  const phoneNumber = data.phoneNumber || "";

  return (
    <div className="min-h-screen bg-muted/30 py-4 print:py-0 print:bg-white flex justify-center text-[10px] leading-tight font-sans">
      <div className="w-full max-w-[210mm] bg-white shadow-xl print:shadow-none print:w-full print:max-w-none">
        
        {/* Header Actions */}
        <div className="flex justify-end p-4 mb-2 print:hidden bg-background border-b text-foreground gap-2">
          <Button onClick={() => window.history.back()} variant="outline">
            Back to Entry
          </Button>
          <Button 
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `Invoice - ${customerName}`,
                    text: `Here is the invoice for ${customerName}`,
                    url: window.location.href
                  });
                } catch (err) {
                  console.error("Error sharing", err);
                }
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Invoice link copied to clipboard!");
              }
            }} 
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Share to WhatsApp
          </Button>
          <Button onClick={() => window.print()} variant="default">
            Print / Save PDF
          </Button>
        </div>

        {/* Invoice Page Container (A4) */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}} />
        <div className="p-4 sm:p-8 print:p-[10mm] mx-auto w-full box-border text-black bg-white flex flex-col" style={{ aspectRatio: '1 / 1.414', height: '297mm', maxWidth: '210mm', overflow: 'hidden' }}>
          
          <div className="flex justify-between items-end mb-1 print:mb-0 flex-shrink-0">
            <div className="font-bold text-sm italic">TAX INVOICE</div>
            <div className="text-xs">Original Copy For Customer</div>
          </div>

          {/* Main Border Wrapper */}
          <div className="border border-black flex flex-col flex-1 h-full overflow-hidden">
            
            {/* Header Section */}
            <div className="grid grid-cols-2 border-b border-black">
              {/* Left Header */}
              <div className="p-2 border-r border-black">
                <h1 className="font-bold text-sm uppercase">Vanameya Exports And Imports</h1>
                <p>MANNARKKAD P.O, PALAKKAD 678582,</p>
                <p>Phone : 94 95 96 5955</p>
                <p>Email : info@vanameya.com</p>
                <p>GSTIN: 32DHOPA7605F1ZM</p>
                <p>State: Kerala</p>
                <p>fssai Lic.No.: 11326009000235</p>
              </div>
              {/* Right Header */}
              <div className="p-2 flex flex-col items-end justify-between">
                <img src="/logo/teal.png" alt="Vanameya Logo" className="h-24 w-auto object-contain" />
                <div className="w-full text-right mt-2 flex justify-end">
                  <table className="text-left font-semibold">
                    <tbody>
                      <tr><td className="pr-2">Date</td><td>: {currentDate}</td></tr>
                      <tr><td className="pr-2">Invoice No</td><td>: {invoiceNo}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Buyer & Consignee Details */}
            <div className="grid grid-cols-2 border-b border-black">
              {/* Buyer */}
              <div className="p-2 border-r border-black">
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-24 align-top">Buyer Name</td><td className="align-top">: {customerName}</td></tr>
                    <tr><td className="align-top">Buyer Address</td><td className="align-top uppercase text-[9px] break-words whitespace-pre-wrap">: {billingAddress}</td></tr>
                    <tr><td className="align-top">Contact No</td><td className="align-top">: {phoneNumber}</td></tr>
                    <tr><td className="align-top">Email</td><td className="align-top">: {data.email || ""}</td></tr>
                    <tr><td className="align-top">GSTIN</td><td className="align-top">: {data.gstNumber || ""}</td></tr>
                    <tr><td className="align-top">State</td><td className="align-top">: </td></tr>
                  </tbody>
                </table>
              </div>
              {/* Consignee */}
              <div className="p-2">
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-28 align-top">Consignee Name</td><td className="align-top">: {customerName}</td></tr>
                    <tr><td className="align-top">Consignee Address</td><td className="align-top uppercase text-[9px] break-words whitespace-pre-wrap">: {shippingAddress}</td></tr>
                    <tr><td className="align-top">Contact No</td><td className="align-top">: {phoneNumber}</td></tr>
                    <tr><td className="align-top">Email</td><td className="align-top">: {data.email || ""}</td></tr>
                    <tr><td className="align-top">GSTIN</td><td className="align-top">: {data.gstNumber || ""}</td></tr>
                    <tr><td className="align-top">State</td><td className="align-top">: </td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transport & Supply Details */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-32">Transportation Mode</td><td>: {data.delivery}</td></tr>
                    <tr><td>Vehicle No</td><td>: </td></tr>
                    <tr><td>Dispatch No</td><td>: </td></tr>
                  </tbody>
                </table>
              </div>
              <div className="p-2">
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-28">Date Of Supply</td><td>: {currentDate}</td></tr>
                    <tr><td>Place Of Supply</td><td>: Ernakulam</td></tr>
                    <tr><td>E-WayBill No</td><td>: </td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item Table Header */}
            <div className="flex-grow flex flex-col relative">
              <div className="border-b border-black bg-gray-50 flex text-center font-bold">
                <div className="w-8 border-r border-black py-1">SL No</div>
                <div className="flex-1 border-r border-black py-1 text-left px-2">Description of goods /Service</div>
                <div className="w-16 border-r border-black py-1">HSN/SAC</div>
                <div className="w-10 border-r border-black py-1">GST %</div>
                <div className="w-20 border-r border-black py-1">Qty</div>
                <div className="w-16 border-r border-black py-1">Rate</div>
                <div className="w-10 border-r border-black py-1">Disc %</div>
                <div className="w-20 border-r border-black py-1">Taxable Value</div>
                {isSale && data.gstType === "Intra-state" ? (
                  <>
                    <div className="w-14 border-r border-black py-1">CGST</div>
                    <div className="w-14 border-r border-black py-1">SGST</div>
                  </>
                ) : (
                  <div className="w-16 border-r border-black py-1">IGST</div>
                )}
                <div className="w-12 border-r border-black py-1">CESS</div>
                <div className="w-24 py-1">Total Amount</div>
              </div>

              {/* Item Row 1 */}
              <div className="flex flex-1 relative border-b border-black">
                <div className="w-8 border-r border-black text-center pt-2">1</div>
                <div className="flex-1 border-r border-black px-2 pt-2">{data.product}</div>
                <div className="w-16 border-r border-black text-center pt-2">09011111</div>
                <div className="w-10 border-r border-black text-center pt-2">{gstPercent}</div>
                <div className="w-20 border-r border-black text-center pt-2">{qty}</div>
                <div className="w-16 border-r border-black text-center pt-2">{inclusiveRate.toFixed(2)}</div>
                <div className="w-10 border-r border-black text-center pt-2">0</div>
                <div className="w-20 border-r border-black text-right pr-2 pt-2">{taxableValue.toFixed(2)}</div>
                {isSale && data.gstType === "Intra-state" ? (
                  <>
                    <div className="w-14 border-r border-black text-right pr-2 pt-2">{cgst.toFixed(2)}</div>
                    <div className="w-14 border-r border-black text-right pr-2 pt-2">{sgst.toFixed(2)}</div>
                  </>
                ) : (
                  <div className="w-16 border-r border-black text-right pr-2 pt-2">
                    {isSale ? igst.toFixed(2) : "0.00"}
                  </div>
                )}
                <div className="w-12 border-r border-black text-right pr-2 pt-2">0.00</div>
                <div className="w-24 text-right pr-2 pt-2">{(taxableValue + totalTax).toFixed(2)}</div>
              </div>

              {/* Courier Charge Row */}
              {courierCharge > 0 && (
                <div className="flex relative border-b border-black bg-gray-50/50">
                  <div className="w-8 border-r border-black text-center pt-2">2</div>
                  <div className="flex-1 border-r border-black px-2 pt-2">Courier / Handling Fee</div>
                  <div className="w-16 border-r border-black text-center pt-2">-</div>
                  <div className="w-10 border-r border-black text-center pt-2">-</div>
                  <div className="w-20 border-r border-black text-center pt-2">1</div>
                  <div className="w-16 border-r border-black text-center pt-2">{courierCharge.toFixed(2)}</div>
                  <div className="w-10 border-r border-black text-center pt-2">-</div>
                  <div className="w-20 border-r border-black text-right pr-2 pt-2">{courierCharge.toFixed(2)}</div>
                  {isSale && data.gstType === "Intra-state" ? (
                    <>
                      <div className="w-14 border-r border-black text-right pr-2 pt-2">0.00</div>
                      <div className="w-14 border-r border-black text-right pr-2 pt-2">0.00</div>
                    </>
                  ) : (
                    <div className="w-16 border-r border-black text-right pr-2 pt-2">0.00</div>
                  )}
                  <div className="w-12 border-r border-black text-right pr-2 pt-2">0.00</div>
                  <div className="w-24 text-right pr-2 pt-2">{courierCharge.toFixed(2)}</div>
                </div>
              )}



              {/* Vertical lines to fill space if needed */}
              <div className="flex-1 flex pointer-events-none absolute inset-0 pt-[28px] border-b border-black">
                <div className="w-8 border-r border-black h-full"></div>
                <div className="flex-1 border-r border-black h-full"></div>
                <div className="w-16 border-r border-black h-full"></div>
                <div className="w-10 border-r border-black h-full"></div>
                <div className="w-20 border-r border-black h-full"></div>
                <div className="w-16 border-r border-black h-full"></div>
                <div className="w-10 border-r border-black h-full"></div>
                <div className="w-20 border-r border-black h-full"></div>
                {isSale && data.gstType === "Intra-state" ? (
                  <>
                    <div className="w-14 border-r border-black h-full"></div>
                    <div className="w-14 border-r border-black h-full"></div>
                  </>
                ) : (
                  <div className="w-16 border-r border-black h-full"></div>
                )}
                <div className="w-12 border-r border-black h-full"></div>
                <div className="w-24 h-full"></div>
              </div>

              {/* Grand Total Row */}
              <div className="flex font-bold z-10 bg-white border-b border-black">
                <div className="flex-1 flex border-r border-black text-center py-2 justify-center italic">Grand Total</div>
                <div className="w-20 border-r border-black text-center py-2">{qty}</div>
                <div className="w-16 border-r border-black"></div>
                <div className="w-10 border-r border-black"></div>
                <div className="w-20 border-r border-black text-right pr-2 py-2">{totalTaxableValue.toFixed(2)}</div>
                {isSale && data.gstType === "Intra-state" ? (
                  <>
                    <div className="w-14 border-r border-black text-right pr-2 py-2">{cgst.toFixed(2)}</div>
                    <div className="w-14 border-r border-black text-right pr-2 py-2">{sgst.toFixed(2)}</div>
                  </>
                ) : (
                  <div className="w-16 border-r border-black text-right pr-2 py-2">
                    {isSale ? igst.toFixed(2) : "0.00"}
                  </div>
                )}
                <div className="w-12 border-r border-black text-right pr-2 py-2">0.00</div>
                <div className="w-24 text-right pr-2 py-2 flex flex-col leading-[1.1]">
                  <span>{totalAmount.toFixed(2)}</span>
                  <span className="text-[8px] font-normal italic">(incl. gst)</span>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-[1fr_auto] flex-shrink-0 min-h-[140px]">
              {/* Left Footer Info */}
              <div className="p-2 border-r border-black flex flex-col">
                <table className="w-full mb-4">
                  <tbody>
                    <tr><td className="w-24 font-semibold">Amount in Words</td><td>:</td></tr>
                    <tr><td colSpan={2} className="italic font-bold text-sm pt-1">{amountInWords}</td></tr>
                  </tbody>
                </table>
                <div className="mt-auto">
                  <p className="font-semibold mb-1">Narration :</p>
                  <p className="font-semibold mt-4 underline underline-offset-2">Declaration</p>
                </div>
              </div>

              {/* Right Footer Info */}
              <div className="w-[300px] flex flex-col">
                <div className="p-2">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td colSpan={2} className="font-semibold pb-1">Company Bank Details :</td></tr>
                      <tr><td className="w-24">Bank</td><td>: FEDERAL BANK</td></tr>
                      <tr><td>A/C No</td><td>: 14090200012404</td></tr>
                      <tr><td>Branch & IFSC Code</td><td>: Mannarkkad , FDRL0001409</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex-1 flex flex-col p-2 pt-4 relative">
                  <p className="text-center font-bold mb-2">For Vanameya Exports and Imports</p>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-center">
                      <img src={qrUrl} alt="QR Code" className="w-[60px] h-[60px] object-contain border border-black p-0.5" />
                      <span className="text-[6px] [writing-mode:vertical-rl] rotate-180 ml-1">Scan QR for payment</span>
                    </div>
                    <p className="text-right">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <p className="text-center mt-1 text-[10px] flex-shrink-0">This is a Computer Generated Invoice</p>
        </div>
      </div>
    </div>
  );
}
