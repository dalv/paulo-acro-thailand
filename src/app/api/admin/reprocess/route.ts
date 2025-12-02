import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { appendToSheet } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'This session has not been paid' },
        { status: 400 }
      );
    }

    // Save to Google Sheets
    await appendToSheet({
      fullName: session.metadata?.fullName || '',
      email: session.metadata?.email || session.customer_email || '',
      acroRole: session.metadata?.acroRole || '',
      selectedSessions: session.metadata?.selectedSessions?.split(',') || [],
      sessionDetails: session.metadata?.sessionDetails || '',
      totalAmount: (session.amount_total || 0) / 100,
      paymentStatus: 'Paid',
      stripeSessionId: session.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reprocess error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}