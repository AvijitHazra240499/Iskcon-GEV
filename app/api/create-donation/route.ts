import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
  try {
    const { amount, campaignId, campaignName, sevaOpportunityId, quantity } = await req.json()

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `donation_${Date.now()}`,
      notes: {
        campaignId,
        campaignName,
        sevaOpportunityId,
        quantity,
      },
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
