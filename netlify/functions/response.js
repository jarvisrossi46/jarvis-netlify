const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod === 'POST') {
        // Receive response from Jarvis (via sessions_send from Mac)
        const body = JSON.parse(event.body);
        const { sender, content } = body;
        
        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender: sender || 'jarvis', content, type: 'outgoing' }])
            .select()
            .single();
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error }) };
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', data }) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
};