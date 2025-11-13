import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: `${request.method} not allowed` }), {
				status: 405,
				headers: corsHeaders,
			});
		}

		try {
			const openaiKey = env.OPENAI_API_KEY;
			const supabaseKey = env.SUPABASE_API_KEY;
			const supabaseUrl = env.SUPABASE_URL;

			if (!openaiKey) throw new Error('Missing OPENAI_API_KEY');
			if (!supabaseKey) throw new Error('Missing SUPABASE_API_KEY');
			if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');

			const openai = new OpenAI({ apiKey: openaiKey });
			const supabase = createClient(supabaseUrl, supabaseKey);

			const { content } = await request.json();
			if (!content) throw new Error('Missing content in request');

			console.log('Received content from frontend:', content);

			const embeddingRes = await openai.embeddings.create({
				model: 'text-embedding-3-small',
				input: content,
			});
			const embedding = embeddingRes.data[0].embedding;

			const { data, error } = await supabase.rpc('match_movies', {
				query_embedding: embedding,
				match_threshold: 0.5,
				match_count: 3,
			});

			if (error) throw error;

			const context = data.map((d) => d.content).join('\n');

			console.log('Context retrieved from Supabase:', context);

			const chatRes = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
					},
					{ role: 'user', content: `Context: ${context} Question: ${content}` },
				],
				temperature: 0.65,
			});

			const answer = chatRes.choices[0].message.content;

			return new Response(JSON.stringify({ answer }), { headers: corsHeaders });
		} catch (err) {
			console.error('Worker error:', err);
			return new Response(JSON.stringify({ error: err.message }), {
				status: 500,
				headers: corsHeaders,
			});
		}
	},
};
