const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yavgjvbcfhzcvbvktvkw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdmdqdmJjZmh6Y3Zidmt0dmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ3ODkzNiwiZXhwIjoyMDg3MDU0OTM2fQ.Zy9T-l-C0Ao1_leEz2Sx6uqi22gJnvzohcf8SYl70Qk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-User',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        const { sender, content, recipient } = body;
        
        // Store response with recipient for siloing
        const { data, error } = await supabase
            .from('messages')
            .insert([{ 
                sender: sender || 'jarvis', 
                content, 
                type: 'outgoing',
                recipient: recipient || 'arry'  // Default to arry if not specified
            }])
            .select()
            .single();
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', data }) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
