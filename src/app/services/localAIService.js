import { pipeline } from '@xenova/transformers';

const DATA_TAG = '%%DATA%%'
const DETERMINISM_RATE = 0.1
const EMPLOYEE_DESCRIPTION = `Here is the employee data: ${DATA_TAG}\n\nWrite a single, cohesive employee bio based on that data. Output only the bio.`;
const EMPLOYER_DESCRIPTION = `Here is the employer data: ${DATA_TAG}\n\nWrite a single, cohesive company description based on that data. Output only the description.`;
const MGS_NO_DETAILS = 'Details not available.';

let generator = null;

async function initGenerator() {

    if (generator) return;
    generator = await pipeline('text-generation', 'Xenova/gpt2', {quantized: true});

}

async function askWithData(prompt, data) {

    if (! data) return MGS_NO_DETAILS;
    const values_ = JSON.stringify(data);
    if (! values_) return MGS_NO_DETAILS;
    return await askLocalAI(prompt.replace(DATA_TAG, values_));

}

export async function askLocalAI(prompt, opts = {}) {

    await initGenerator();
    const { max_length = 150, temperature = DETERMINISM_RATE, top_k = 40 } = opts;
    const result = await generator(prompt, { max_length, temperature, top_k });
    return result[0].generated_text;

}

export async function describeEmployee(data) {

    return await askWithData(EMPLOYEE_DESCRIPTION, data);

}

export async function describeEmployer(data) {

    return await askWithData(EMPLOYER_DESCRIPTION, data);

}