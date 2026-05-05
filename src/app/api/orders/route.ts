import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

// Google Sheets Web App URL (URL-encoded POST, no CORS on server)
const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbyhtOhuYIAm9J7YeC1yH_k3cwwVlQu3w6J63_nar7AEqYwglNfUaBfsVDj-9FEEcRGjHw/exec";

const orderSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"),
  address: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  quantity: z.number().int().min(1, "কমপক্ষে ১টি জার অর্ডার করুন").max(20, "সর্বোচ্চ ২০টি জার অর্ডার করা যাবে"),
  shipping: z.number().int().min(0),
  total: z.number().int().min(0),
  honeypot: z.string().max(0, "স্প্যাম সনাক্ত হয়েছে"),
});

/** Forward order data to Google Sheets via URL-encoded POST */
async function sendToGoogleSheets(data: {
  name: string;
  phone: string;
  address: string;
  quantity: number;
  total: number;
}) {
  const params = new URLSearchParams({
    name: data.name,
    phone: data.phone,
    address: data.address,
    product: "Basmati Rice Jar",
    quantity: String(data.quantity),
    total: String(data.total),
  });

  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Google Sheets returned status ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.issues.map((issue) => ({
            field: String(issue.path[0]),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, phone, address, quantity, shipping, total } = result.data;

    // Verify total calculation
    const expectedTotal = quantity * 1050 + shipping;
    if (total !== expectedTotal) {
      return NextResponse.json(
        { success: false, errors: [{ field: "total", message: "মোট মূল্য সঠিক নয়" }] },
        { status: 400 }
      );
    }

    // Verify shipping logic
    if (quantity >= 2 && shipping !== 0) {
      return NextResponse.json(
        { success: false, errors: [{ field: "shipping", message: "২ জারের বেশি অর্ডারে ফ্রি ডেলিভারি" }] },
        { status: 400 }
      );
    }

    // Primary storage: Google Sheets
    await sendToGoogleSheets({ name, phone, address, quantity, total });

    // Optional: Try to save to local database (fails gracefully on Vercel)
    let orderId: string | undefined;
    try {
      const { db } = await import("@/lib/db");
      const order = await db.order.create({
        data: { name, phone, address, quantity, shipping, total },
      });
      orderId = order.id.toString();
    } catch {
      // SQLite not available on Vercel — that's fine, Google Sheets is the primary store
      console.log("Local DB save skipped (not available in serverless environment)");
      orderId = `GS-${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, errors: [{ field: "server", message: "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন" }] },
      { status: 500 }
    );
  }
}
