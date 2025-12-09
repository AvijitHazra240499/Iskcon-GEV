import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, campaignId, amount, sevaOpportunityId, quantity } = await req.json()

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Update campaign with donation amount
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Record the donation
    const { error: donationError } = await supabase.from("donations").insert([
      {
        campaign_id: campaignId,
        amount: amount,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        payment_status: "completed",
      },
    ])

    if (donationError) throw donationError

    // Update campaign if campaignId exists
    if (campaignId) {
      const { data: campaign } = await supabase
        .from("donation_campaigns")
        .select("raised_amount")
        .eq("id", campaignId)
        .single()

      const newRaisedAmount = (campaign?.raised_amount || 0) + amount

      const { error } = await supabase
        .from("donation_campaigns")
        .update({ raised_amount: newRaisedAmount })
        .eq("id", campaignId)

      if (error) throw error
    }

    // Update seva opportunity if sevaOpportunityId exists
    if (sevaOpportunityId && quantity) {
      const { data: seva } = await supabase
        .from("seva_opportunities")
        .select("obtained_quantity")
        .eq("id", sevaOpportunityId)
        .single()

      const newObtainedQuantity = (seva?.obtained_quantity || 0) + quantity

      const { error: sevaError } = await supabase
        .from("seva_opportunities")
        .update({ obtained_quantity: newObtainedQuantity })
        .eq("id", sevaOpportunityId)

      if (sevaError) throw sevaError
    }

    return NextResponse.json({ success: true, message: "Donation verified and recorded" })
  } catch (error) {
    console.error("Error verifying donation:", error)
    return NextResponse.json({ error: "Failed to verify donation" }, { status: 500 })
  }
}
