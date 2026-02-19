const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

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

    if (event.httpMethod === 'GET') {
        // Get messages since ID
        const since = event.queryStringParameters?.since || 0;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .gt('id', since)
            .order('id', { ascending: true });
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error }) };
        return { statusCode: 200, headers, body: JSON.stringify(data) };
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
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error }) };
        
        // Send webhook to user's Mac for WhatsApp notification
        try {
            await fetch(process.env.WEBHOOK_URL || 'http://100.112.231.84:8081/webhook/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, content })
            });
        } catch (e) {
            console.log('Webhook failed (Mac may be offline):', e.message);
        }
        
        return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
};