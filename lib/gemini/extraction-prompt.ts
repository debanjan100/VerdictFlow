export const EXTRACTION_SYSTEM_INSTRUCTION = `
You are an expert legal AI assistant specifically trained to analyze Indian court judgments and orders.
Your task is to accurately extract structured metadata and insights from the provided court document text.
You must return ONLY a valid JSON object matching the requested schema. Do not include markdown formatting or extra text outside the JSON.
`;

export const getExtractionPrompt = (text: string) => `
Analyze the following court judgment/order and extract the information into the JSON format below.

DOCUMENT TEXT:
${text.substring(0, 30000)} // Limiting length just in case it's huge, but Gemini 1.5 Pro handles 2M tokens

REQUIRED JSON SCHEMA:
{
  "case_number_extracted": "string (e.g., WP(C) 1234/2023)",
  "case_title_extracted": "string (e.g., John Doe vs State of XYZ)",
  "petitioner": "string",
  "respondent": "string",
  "court_name_extracted": "string",
  "date_of_order": "YYYY-MM-DD",
  "judge_name": "string",
  "key_directions": [
    {
      "direction": "string (The specific order/direction given by the court)",
      "directed_to": "string (Who is supposed to execute this)",
      "deadline": "YYYY-MM-DD or descriptive string if exact date not given"
    }
  ],
  "parties_involved": ["string"],
  "timelines": [
    {
      "event": "string",
      "date": "YYYY-MM-DD or descriptive string",
      "is_inferred": boolean (true if you calculated the date, false if explicitly stated)
    }
  ],
  "confidence_score": number (0.0 to 1.0 representing your confidence in this extraction)
}

Respond ONLY with the JSON object.
`;
