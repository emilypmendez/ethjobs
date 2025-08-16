import { pipeline } from '@xenova/transformers';

const DATA_TAG = '%%DATA%%'
const DETERMINISM_RATE = 0.1
const EMPLOYEE_DESCRIPTION = `Here is the employee data: ${DATA_TAG}\n\nWrite a single, cohesive employee bio based on that data. Output only the bio.`;
const EMPLOYEE_DESCRIPTIONS = [
    `Here is the employee data: ${DATA_TAG}\n\nWrite a single, cohesive employee bio based on that data. Output only the bio.`,
    `Employee details: ${DATA_TAG}\n\nGenerate a concise “About the Employee” paragraph. Return just the paragraph, nothing else.`,
    `Using the information below, craft an employee overview: ${DATA_TAG}\n\nProvide only the final overview. Do not include any analysis or commentary.`,
    `Data: ${DATA_TAG}\n\nProduce a short employee profile suitable for a team page. Only output the profile text.`,
    `Below are the key facts about an employee: ${DATA_TAG}\n\nCreate a standalone employee description. Do not include headings, explanations, or step-by-step reasoning—only the description.`,
    `Employee raw data: ${DATA_TAG}\n\nWrite exactly one paragraph describing this employee. Output the paragraph only.`,
    `Given: ${DATA_TAG}\n\nReturn a brief, professional employee summary. The response must contain only the summary text.`,
];
const EMPLOYER_DESCRIPTION = `Here is the employer data: ${DATA_TAG}\n\nWrite a single, cohesive company description based on that data. Output only the description.`;
const EMPLOYER_DESCRIPTIONS = [
    `Here is the employer data: ${DATA_TAG}\n\nWrite a single, cohesive company description based on that data. Output only the description.`,
    `Employer details: ${DATA_TAG}\n\nGenerate a concise “About the Employer” paragraph. Return just the paragraph, nothing else.`,
    `Using the information below, craft an employer overview: ${DATA_TAG}\n\nProvide only the final overview. Do not include any analysis or commentary.`,
    `Data: ${DATA_TAG}\n\nProduce a short employer profile that could appear on a careers page. Only output the profile text.`,
    `Below are the key facts about a company: ${DATA_TAG}\n\nCreate a standalone employer description. Do not include headings, explanations, or step-by-step reasoning—only the description.`,
    `Company raw data: ${DATA_TAG}\n\nWrite exactly one paragraph describing this employer. Output the paragraph only.`,
    `Given: ${DATA_TAG}\n\nReturn a brief, professional employer summary. The response must contain only the summary text.`
];
const MGS_NO_DETAILS = 'Details not available.';

let generator = null;

async function askWithData(prompt, data) {

    if (! data) return MGS_NO_DETAILS;
    const values_ = JSON.stringify(data);
    if (! values_) return MGS_NO_DETAILS;
    return await askLocalAI(prompt.replace(DATA_TAG, values_));

}

async function initGenerator() {

    if (generator) return;
    generator = await pipeline('text-generation', 'Xenova/gpt2', {quantized: true});

}

function randomFromArray(arr) {

    return arr[Math.floor(Math.random() * arr.length)];

}

export async function askLocalAI(prompt, opts = {}) {

    await initGenerator();
    const { max_length = 150, temperature = DETERMINISM_RATE, top_k = 40 } = opts;
    const result = await generator(prompt, { max_length, temperature, top_k });
    return result[0].generated_text;

}

export async function describeEmployee(data) {

    // return await askWithData(EMPLOYEE_DESCRIPTION, data);
    return await askWithData(randomFromArray(EMPLOYEE_DESCRIPTIONS), data);

}

export async function describeEmployer(data) {

    // return await askWithData(EMPLOYER_DESCRIPTION, data);
    return await askWithData(randomFromArray(EMPLOYER_DESCRIPTIONS), data);

}