import fetch from "node-fetch";

// ============================
// ⚠️ Ensure all required env vars exist
// ============================
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PAYBILL,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL
} = process.env;

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_PAYBILL || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
  throw new Error("Missing one or more M-Pesa environment variables.");
}

// ============================
// ✅ Constants
// ============================
const OAUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

// ============================
// 🔐 Generate OAuth Token
// ============================
export async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");

  const res = await fetch(OAUTH_URL, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` }
  });

  const text = await res.text();

  console.log("🔐 MPESA OAUTH STATUS:", res.status);
  console.log("🔐 MPESA OAUTH RAW RESPONSE:", text);

  if (!res.ok) throw new Error(`OAuth failed (${res.status}): ${text}`);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`OAuth JSON parse failed: ${err.message}`);
  }

  if (!data.access_token) throw new Error("OAuth failed: No access_token returned");

  return data.access_token;
}

// ============================
// 📞 Format Kenyan Phone Number
// ============================
export function formatKenyanPhone(phone) {
  if (!phone) throw new Error("Phone number is required");
  phone = phone.toString().trim();

  if (/^07\d{8}$/.test(phone)) return "254" + phone.slice(1);
  if (/^01\d{8}$/.test(phone)) return "254" + phone.slice(1);
  if (/^254\d{9}$/.test(phone)) return phone;

  throw new Error(`Invalid Kenyan phone number: ${phone}`);
}

// ============================
// 📱 M-PESA SANDBOX TEST NUMBERS HELPER
// ============================
export const SANDBOX_NUMBERS = [
  "254701234567", // Test number 1
  "254701234568", // Test number 2
  "254701234569"  // Test number 3
];

/**
 * Returns a valid phone number.
 * If input is invalid, uses a random sandbox number.
 */
export function getTestPhoneNumber(phone) {
  try {
    return formatKenyanPhone(phone);
  } catch (err) {
    console.warn(`⚠️ Invalid phone provided (${phone}), using sandbox test number`);
    const randomIndex = Math.floor(Math.random() * SANDBOX_NUMBERS.length);
    return SANDBOX_NUMBERS[randomIndex];
  }
}

// ============================
// 💳 Initiate STK Push
// ============================
export async function initiateStkPush(phoneNumber, amount, accountRef) {
  try {
    const token = await getAccessToken();

    // Use sandbox test number if input is invalid
    const formattedPhone = getTestPhoneNumber(phoneNumber);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(`${MPESA_PAYBILL}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_PAYBILL,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: MPESA_PAYBILL,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: "Estate Payment"
    };

    const res = await fetch(STK_PUSH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("📲 STK STATUS:", res.status);
    console.log("📲 STK RAW RESPONSE:", text);

    if (!res.ok) throw new Error(`STK Push failed (${res.status}): ${text}`);

    const data = JSON.parse(text);
    if (data.ResponseCode !== "0") {
      throw new Error(`STK Push failed: ${data.ResponseDescription}`);
    }

    console.log("✅ STK Push initiated successfully. CheckoutRequestID:", data.CheckoutRequestID);

    return data;
  } catch (err) {
    console.error("❌ MPESA STK ERROR:", err.message);
    throw err;
  }
}
