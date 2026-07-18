const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description.",
    ),
  technicalQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview."),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking the technical question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover,what approach to take etc",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them.",
    ),
  behavioralQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview."),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking the technical question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover,what approach to take etc",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them.",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "The skill which the candidate is lacking and needs to improve.",
          ),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of the skill gap."),
      }),
    )
    .describe(
      "List of skill gaps that the candidate has and needs to improve.",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1."),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g., 'Data Structures', 'System Design', etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be completed on this day to improve skills and prepare for the interview. e.g. read a specific book, solve a set of problems, watch a tutorial, etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to improve their skills and prepare for the interview.",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert interviewer.

Analyze the candidate.

Return ONLY valid JSON in exactly this format.

{
  "matchScore": number,
  "technicalQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": []
    }
  ]
}

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });
  return JSON.parse(response.text);
}

module.exports = generateInterviewReport;
