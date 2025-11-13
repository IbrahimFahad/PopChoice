import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Constrol-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: `${request.method} method not allowed.` }), { status: 405, headers: corsHeaders });
		}

		/** OpenAI config */
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: 'https://gateway.ai.cloudflare.com/v1/1433d8205e17a783fa1805576eb2de76/popchoice/openai',
		});

		/** Supabase config */
		const privateKey = env.SUPABASE_API_KEY;
		if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
		const url = env.SUPABASE_URL;
		if (!url) throw new Error(`Expected env var SUPABASE_URL`);
		const supabase = createClient(url, privateKey);

		const query = await request.json();

		const querygetEmbedding = await getEmbedding(query.content);

		const match = await findNearestMatch(querygetEmbedding);
		return await ChatCompletion(match, query.content);

		async function getEmbedding(input) {
			const embedding = await openai.embeddings.create({
				model: 'text-embedding-3-small',
				input: input,
			});
			return embedding;
		}
		async function findNearestMatch(embedding) {
			const { data } = await supabase.rpc('match_movies', {
				query_embedding: embedding,
				match_threshold: 0.5,
				match_count: 3,
			});

			const match = data.map((obj) => obj.content).join('\n');
			return match;
		}

		async function storeEmbeddings() {
			console.log('Getting embeddings...');
			const embeddings = await getEmbedding(movies.map((m) => m.content));
			console.log('Embeddings received:', embeddings.data.length);
			const movieEmbeddings = movies.map((movie, i) => ({
				content: movie.content,
				embedding: embeddings.data[i].embedding,
			}));
			console.log('Start Storing...');
			const { data, error } = await supabase.from('movies').insert(movieEmbeddings);
			if (error) {
				console.error('Error storing embeddings:', error);
			} else {
				console.log('Stored embeddings complete:', data);
			}
		}

		async function ChatCompletion(input, query) {
			try {
				const chatMessages = [
					{
						role: 'system',
						content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
					},
				];
				chatMessages.push({
					role: 'user',
					content: { text: `Context: ${input} Question: ${query}` },
				});

				const response = await openai.chat.completions.create({
					model: 'gpt-4o-mini',
					messages: chatMessages,
					temperature: 0.65,
					frequency_penalty: 0.5,
				});
				const responsed = response.choices[0].message.content;
				return new Response(JSON.stringify(responsed), { headers: corsHeaders });
			} catch (error) {
				return new Response(JSON.stringify({ error: error.message }), {
					status: 500,
					headers: corsHeaders,
				});
			}
		}
	},
};
