from groq import Groq

from config import settings


client = Groq(
    api_key=settings.GROQ_API_KEY
)


def generate_answer(
    question: str,
    context: str
) -> str:
    """
    Generate a final answer using the exact
    analysis result or retrieved RAG context.

    The provided context is authoritative.
    """

    prompt = f"""
You are an AI Data Analyst.

Answer the user's question using ONLY the
information provided in the context.

IMPORTANT:

The context may contain an EXACT result calculated
by Python from the dataset.

If the context contains an exact analytical result:

- Treat it as authoritative.
- Do NOT recalculate it.
- Do NOT retrieve or infer additional records.
- Do NOT remove any values.
- Do NOT omit any items from a list.
- Preserve ALL values present in the result.
- Do NOT replace the result with information from
  your general knowledge.
- Do NOT invent values.

For list/distinct questions, include EVERY item
listed under "Results".

For example, if the context says:

Results:
- Laptop
- Tablet
- Monitor

the answer MUST mention:

Laptop, Tablet, and Monitor.

Do not answer with only some of the values.

Give a clear and concise natural-language answer.

============================================================
DATASET / ANALYSIS CONTEXT
============================================================

{context}

============================================================
USER QUESTION
============================================================

{question}

============================================================
ANSWER
============================================================
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise AI Data Analyst. "
                    "Never omit values from an exact "
                    "analysis result."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    answer = response.choices[0].message.content

    if not answer:
        return "I could not generate an answer."

    return answer.strip()