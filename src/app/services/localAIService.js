import { pipeline } from '@xenova/transformers';

DETERMINISM_RATE = 0.1

let generator = null;

async function initGenerator() {

    if (generator) return;
    generator = await pipeline('text-generation', 'Xenova/gpt2', {quantized: true});

}

export async function askLocalAI(prompt, opts = {}) {

    await initGenerator();
    const { max_length = 150, temperature = DETERMINISM_RATE, top_k = 40 } = opts;
    const result = await generator(prompt, { max_length, temperature, top_k });
    return result[0].generated_text;

}
