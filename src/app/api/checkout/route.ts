import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('=== Checkout API called ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { 
      fullName, 
      email, 
      acroRole, 
      selectedSessions, 
      sessionDetails,
      totalAmount 
    } = body;

    // Validate required fields
    if (!fullName || !email || !acroRole || !selectedSessions?.length) {
      console.error('✗ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating Stripe checkout session...');

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'Acrobatics Workshop - Koh Phangan',
              description: sessionDetails,
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancel`,
      metadata: {
        fullName,
        email,
        acroRole,
        selectedSessions: selectedSessions.join(','),
        sessionDetails,
      },
    });

    console.log('✓ Checkout session created:', session.id);
    console.log('Checkout URL:', session.url);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('✗ Checkout API error');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}