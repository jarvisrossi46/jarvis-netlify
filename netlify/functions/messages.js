const { createClient } = require('@supabase/supabase-js');

// Embedded credentials (since Netlify env API failed)
const SUPABASE_URL = 'https://yavgjvbcfhzcvbvktvkw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdmdqdmJjZmh6Y3Zidmt0dmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ3ODkzNiwiZXhwIjoyMDg3MDU0OTM2fQ.Zy9T-l-C0Ao1_leEz2Sx6uqi22gJnvzohcf8SYl70Qk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ensure table exists
let tableChecked = false;
async function ensureTable() {
    if (tableChecked) return;
    try {
        // Try to query - if table doesn't exist, this will fail
        await supabase.from('messages').select('id').limit(1);
    } catch (e) {
        // Table doesn't exist, create it via SQL
        await supabase.rpc('create_messages_table');
    }
    tableChecked = true;
}

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    await ensureTable();

    if (event.httpMethod === 'GET') {
        // Get messages since ID
        const since = event.queryStringParameters?.since || 0;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .gt('id', since)
            .order('id', { ascending: true });
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (event.httpMethod === 'POST') {
        // Store incoming message
        const body = JSON.parse(event.body);
        const { sender, content } = body;
        
        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender, content, type: 'incoming' }])
            .select()
            .single();
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
        
        // Send webhook to Mac for WhatsApp notification
        try {
            await fetch('http://100.112.231.84:8081/webhook/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, content })
            });
        } catch (e) {
            console.log('Webhook to Mac failed:', e.message);
        }
        
        return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
