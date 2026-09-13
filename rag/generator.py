from groq import Groq

from config import settings


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=settings.GROQ_API_KEY
)


# ============================================================
# GENERATE ANSWER
# ============================================================

def generate_answer(
    question: str,
    context: str
) -> str:
    """
    Generate a concise final answer using the exact
    analysis result or retrieved RAG context.

    The provided context is authoritative.
    """

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
You are an AI Data Analyst.

Answer the user's question using ONLY the information
provided in the context.

IMPORTANT:

- The context may contain an EXACT result calculated by Python.
- Treat exact analytical results as authoritative.
- Do NOT recalculate the result.
- Do NOT invent values.
- Do NOT remove values.
- Do NOT omit values.
- Do NOT use general knowledge.
- For grouped results, include every group and its value.
- For distinct/list questions, include every item provided.
- Return ONLY the final answer.
- Do NOT provide reasoning.
- Do NOT provide a thinking process.
- Do NOT explain how you arrived at the answer.
- Keep the answer concise.

============================================================
DATASET / ANALYSIS CONTEXT
============================================================

{context}

============================================================
USER QUESTION
============================================================

{question}

============================================================
FINAL ANSWER
============================================================
"""

    # ========================================================
    # CALL GROQ
    # ========================================================

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise AI Data Analyst. "
                    "Return only the final answer. "
                    "Never expose reasoning or thinking. "
                    "Never omit values from an exact analysis result."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        max_completion_tokens=512,

        temperature=0,

        reasoning_effort="none",

        reasoning_format="hidden",
    )

    # ========================================================
    # GET ANSWER
    # ========================================================

    answer = (
        response
        .choices[0]
        .message
        .content
    )

    # ========================================================
    # EMPTY RESPONSE FALLBACK
    # ========================================================

    if not answer:
        return context.strip()

    # ========================================================
    # CLEAN ANSWER
    # ========================================================

    answer = answer.strip()

    # ========================================================
    # SAFETY CLEANUP
    # ========================================================

    if "<think>" in answer:

        if "</think>" in answer:

            answer = (
                answer
                .split("</think>", 1)[1]
                .strip()
            )

        else:

            answer = (
                answer
                .replace("<think>", "")
                .strip()
            )

    return answer