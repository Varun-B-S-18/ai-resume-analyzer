const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { toJSONSchema } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description.",
    ),
  technicalQuestions: z
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
  behavioralQuestions: z
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
Act as an expert Technical Interviewer and Career Coach.

Your task is to analyze the provided Resume and Job Description (JD) to generate a structured Interview Preparation Report.

### INPUT DATA:
- Resume: ${resume}
- Self Description: ${selfDescription}
- Job Description: ${jobDescription}

### GOAL:
Based on the candidate's background, resume, self-description, and the Job Description (JD), generate a JSON object that matches the schema exactly.

1. Calculate the candidate's 'matchScore' based on how well their skills, projects, education, and experience align with the JD.
2. Generate personalized 'technicalQuestions' that focus on the candidate's skills, projects, technologies used, and any missing requirements from the JD.
3. Generate personalized 'behavioralQuestions' based on the candidate's background, strengths, weaknesses, and expected interview scenarios.
4. For EVERY technical and behavioral question, also generate:
   - The interviewer's intention (what skill or knowledge is being evaluated).
   - A detailed, interview-ready sample answer tailored to the candidate's profile.
   - Important points that should be covered while answering.
5. Identify 'skillGaps' by comparing the candidate's resume with the Job Description. Explain why each gap matters and recommend a learning resource.
6. Create a practical 7-day 'preparationPlan' that helps the candidate improve the identified skill gaps and prepare for the interview.

### OUTPUT INSTRUCTIONS:
- Generate ONLY valid JSON.
- DO NOT include markdown, explanations, notes, or additional text.
- DO NOT use keys like 'candidate_details', 'job_role', or any extra top-level keys.
- USE ONLY these top-level keys:
  "title",
  "matchScore",
  "technicalQuestions",
  "behavioralQuestions",
  "skillGaps",
  "preparationPlan".
- For every technical question include:
  - question
  - difficulty
  - intention
  - answer
  - keyPoints
- For every behavioral question include:
  - question
  - intention
  - answer
  - keyPoints
- Ensure all answers are personalized based on the candidate's resume and the Job Description rather than generic textbook responses.
- Ensure 'severity' is strictly one of:
  "low",
  "medium",
  or
  "high".
- Return ONLY valid JSON that matches the schema exactly.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: toJSONSchema(interviewReportSchema),
    },
  });
  return JSON.parse(response.text);
  // console.log(response.text);
  // console.log(JSON.stringify(toJSONSchema(interviewReportSchema), null, 2));
}

module.exports = generateInterviewReport;
