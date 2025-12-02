import { google, sheets_v4 } from 'googleapis';

// Don't initialize at module level - do it lazily
let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  
  // Only initialize when actually called (at runtime, not build time)
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured');
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function appendToSheet(data: {
  fullName: string;
  email: string;
  acroRole: string;
  selectedSessions: string[];
  sessionDetails: string;
  totalAmount: number;
  paymentStatus: string;
  stripeSessionId: string;
}) {
  try {
    // Validate environment variables at runtime
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY is not set');
    }
    if (!process.env.GOOGLE_SHEETS_SHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SHEET_ID is not set');
    }

    console.log('Authenticating with Google Sheets API...');

    const sheets = getSheetsClient();

    const timestamp = new Date().toISOString();
    
    const values = [
      [
        timestamp,
        data.fullName,
        data.email,
        data.acroRole,
        data.selectedSessions.join(', '),
        data.sessionDetails,
        data.totalAmount,
        data.paymentStatus,
        data.stripeSessionId,
      ],
    ];

    console.log('Appending to sheet:', process.env.GOOGLE_SHEETS_SHEET_ID);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Sheet response:', response.data);

    return { success: true };
  } catch (error: any) {
    console.error('=== Google Sheets Error Details ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.errors) {
      console.error('API errors:', JSON.stringify(error.errors, null, 2));
    }
    
    if (error.message?.includes('permission')) {
      console.error('HINT: Make sure the service account has Editor access to the sheet');
    }
    
    if (error.message?.includes('not found')) {
      console.error('HINT: Check that GOOGLE_SHEETS_SHEET_ID is correct');
    }
    
    throw error;
  }
}