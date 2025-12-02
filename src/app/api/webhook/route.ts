import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { appendToSheet } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('=== Webhook received ===');
  console.log('Timestamp:', new Date().toISOString());
  
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✓ Event verified. Type:', event.type);
  } catch (err: any) {
    console.error('✗ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    console.log('=== Processing checkout.session.completed ===');
    const session = event.data.object;
    
    console.log('Session ID:', session.id);
    console.log('Customer email:', session.customer_email);
    console.log('Amount:', session.amount_total);
    console.log('Metadata:', JSON.stringify(session.metadata, null, 2));

    // Validate that we have the required metadata
    if (!session.metadata?.fullName || !session.metadata?.email) {
      console.error('✗ Missing required metadata in session');
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      );
    }

    // Save to Google Sheets
    try {
      console.log('Attempting to save to Google Sheets...');
      
      const sheetData = {
        fullName: session.metadata.fullName,
        email: session.metadata.email,
        acroRole: session.metadata.acroRole,
        selectedSessions: session.metadata.selectedSessions?.split(',') || [],
        sessionDetails: session.metadata.sessionDetails,
        totalAmount: (session.amount_total || 0) / 100,
        paymentStatus: 'Paid',
        stripeSessionId: session.id,
      };

      console.log('Data to save:', JSON.stringify(sheetData, null, 2));

      await appendToSheet(sheetData);

      console.log('✓ Successfully saved to Google Sheets');
    } catch (error: any) {
      console.error('✗ Failed to save to Google Sheets');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      // Don't return an error to Stripe - we got the payment!
      // Just log it so you can manually add the registration later
      // Stripe will retry the webhook if we return an error
    }
  } else {
    console.log('Ignoring event type:', event.type);
  }

  return NextResponse.json({ received: true });
}