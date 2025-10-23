import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Vercel Serverless Function to handle webhook events
 * This replaces the WebSocket server for Vercel deployment
 * 
 * Real-time updates are handled by Supabase Realtime subscriptions
 * in the frontend components (NotificationSystem, Dashboard, OrdersManagement)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const webhookData = req.body;
    console.log('Webhook received:', webhookData);

    // Process the webhook data based on the event type
    // This is where you'd handle different webhook events from your messaging platform
    
    // Example: If this is an order webhook, you might want to:
    // 1. Update the order status in the database
    // 2. The frontend will receive the update automatically via Supabase Realtime

    // Store webhook event for logging/debugging purposes
    const { data, error } = await supabase
      .from('webhook_logs')
      .insert({
        event_type: webhookData.type || 'unknown',
        payload: webhookData,
        received_at: new Date().toISOString()
      });

    if (error) {
      // If webhook_logs table doesn't exist, that's okay - log to console instead
      console.warn('Could not log to webhook_logs table (table may not exist):', error.message);
      console.log('Webhook data:', webhookData);
    }

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received and processed',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
