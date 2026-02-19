const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yavgjvbcfhzcvbvktvkw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdmdqdmJjZmh6Y3Zidmt0dmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ3ODkzNiwiZXhwIjoyMDg3MDU0OTM2fQ.Zy9T-l-C0Ao1_leEz2Sx6uqi22gJnvzohcf8SYl70Qk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VALID_USERS = ['arry', 'ashwin', 'nakul'];

const AGENT_ROUTING = {
    'arry': 'all',
    'ashwin': 'vector',
    'nakul': 'staq'
};

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-User',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    const user = event.headers['x-user'] || event.queryStringParameters?.sender;
    if (!user || !VALID_USERS.includes(user)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (event.httpMethod === 'GET') {
        const since = parseInt(event.queryStringParameters?.since) || 0;
        
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender.eq.${user},and(sender.eq.jarvis,recipient.eq.${user})`)
            .gt('id', since)
            .order('id', { ascending: true });
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify(data || []) };
    }

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        const { sender, content, agent, attachment, attachment_name, attachment_type } = body;
        
        if (sender !== user) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Sender mismatch' }) };
        }
        
        const assignedAgent = agent || AGENT_ROUTING[user];
        
        // Handle file upload if present
        let attachmentUrl = null;
        if (attachment && attachment_name) {
            // Extract base64 data
            const base64Data = attachment.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Upload to Supabase Storage
            const filePath = `${sender}/${Date.now()}_${attachment_name}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('attachments')
                .upload(filePath, buffer, { contentType: attachment_type });
            
            if (!uploadError) {
                const { data: urlData } = supabase
                    .storage
                    .from('attachments')
                    .getPublicUrl(filePath);
                attachmentUrl = urlData.publicUrl;
            }
        }
        
        // Store message
        const { data, error } = await supabase
            .from('messages')
            .insert([{ 
                sender, 
                content, 
                type: 'incoming',
                recipient: assignedAgent === 'all' ? 'jarvis' : assignedAgent,
                attachment_url: attachmentUrl,
                attachment_name: attachment_name,
                attachment_type: attachment_type
            }])
            .select()
            .single();
        
        if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
        
        // Send WhatsApp
        try {
            const agentLabel = assignedAgent === 'all' ? 'Jarvis' : 
                              assignedAgent === 'vector' ? 'Vector' : 'Staq';
            let formattedMessage = `[${sender.toUpperCase()} → ${agentLabel}] ${content}`;
            if (attachment_name) {
                formattedMessage += ` [+${attachment_name}]`;
            }
            
            await fetch('http://100.112.231.84:8081/webhook/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sender, 
                    content: formattedMessage,
                    agent: assignedAgent,
                    hasAttachment: !!attachmentUrl
                })
            });
        } catch (e) {
            console.log('Webhook failed:', e.message);
        }
        
        return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
