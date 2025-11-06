import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, expertId, hourlyRate } = await req.json();
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification data");
    }

    // Verify Razorpay signature
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    
    const expectedSignature = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );
    
    // Create HMAC with secret
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );
    
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (signatureHex !== razorpay_signature) {
      throw new Error("Payment verification failed - invalid signature");
    }

    console.log("Payment verified successfully");

    // Create booking record
    const { error: bookingError } = await supabaseClient
      .from("expert_sessions")
      .insert({
        user_id: user.id,
        expert_id: expertId,
        session_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        amount_paid: parseFloat(hourlyRate || "0"),
        payment_status: "completed",
        session_status: "scheduled",
        stripe_session_id: razorpay_payment_id,
      });

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw bookingError;
    }

    console.log("Booking created successfully for user:", user.id);

    return new Response(
      JSON.stringify({ success: true, verified: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
