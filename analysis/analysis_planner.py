import json
import os

from dotenv import load_dotenv
from groq import Groq


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# GROQ API KEY
# ============================================================

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError(
        "GROQ_API_KEY is not set."
    )


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=api_key
)


# ============================================================
# CREATE ANALYSIS PLAN
# ============================================================

def create_analysis_plan(
    question: str,
    columns: list[str],
    sample_values: dict
) -> dict:
    """
    Convert a natural-language analytical question
    into a structured JSON analysis plan.

    The LLM determines the user's intent.

    Python performs the actual calculation.
    """

    # ========================================================
    # SYSTEM PROMPT
    # ========================================================

    system_prompt = """
You are an analytical query planner for an AI Data Analyst.

Your job is to convert a user's natural-language
question into a strict JSON analytical plan.

DO NOT calculate the answer.

Return ONLY valid JSON.


============================================================
ALLOWED OPERATIONS
============================================================

The allowed operations are:

- total
- average
- median
- count
- minimum
- maximum
- highest
- lowest
- distinct
- group_sum
- group_average
- top_n
- bottom_n


============================================================
JSON FORMAT
============================================================

Every response MUST contain:

{
    "operation": "...",
    "column": "...",
    "group_by": null,
    "filters": {}
}

For top_n and bottom_n, also include:

{
    "n": 3
}


============================================================
MEDIAN
============================================================

Use "median" when the user asks for the
middle/median value of a numeric column.

Examples:

Question:
What is the median sales?

Output:

{
    "operation": "median",
    "column": "Sales",
    "group_by": null,
    "filters": {}
}


Question:
What is the median profit?

Output:

{
    "operation": "median",
    "column": "Profit",
    "group_by": null,
    "filters": {}
}


Question:
What is the median sales in South?

Output:

{
    "operation": "median",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


Question:
What is the median profit for Electronics?

Output:

{
    "operation": "median",
    "column": "Profit",
    "group_by": null,
    "filters": {
        "Category": "Electronics"
    }
}


============================================================
TOP N
============================================================

Use "top_n" when the user asks for the
top N groups ranked by a numeric value.

Examples:

Question:
What are the top 3 products by sales?

Output:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


Question:
What are the top 5 customers by sales?

Output:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Customer",
    "n": 5,
    "filters": {}
}


Question:
What are the top 3 products by profit?

Output:

{
    "operation": "top_n",
    "column": "Profit",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


Question:
What are the top 2 products by sales in South?

Output:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 2,
    "filters": {
        "Region": "South"
    }
}


If the user says "top products" without
specifying a number, use:

"n": 5


============================================================
BOTTOM N
============================================================

Use "bottom_n" when the user asks for the
bottom N groups ranked by a numeric value.

Examples:

Question:
What are the bottom 3 products by sales?

Output:

{
    "operation": "bottom_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


Question:
What are the bottom 5 customers by profit?

Output:

{
    "operation": "bottom_n",
    "column": "Profit",
    "group_by": "Customer",
    "n": 5,
    "filters": {}
}


Question:
What are the bottom 3 products by sales in South?

Output:

{
    "operation": "bottom_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {
        "Region": "South"
    }
}


If the user says "bottom products" without
specifying a number, use:

"n": 5


============================================================
DISTINCT / LIST QUESTIONS
============================================================

Use "distinct" when the user asks WHICH or WHAT
values exist after applying one or more filters.

Examples:

Question:
Which customer purchased a Laptop?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Product": "Laptop"
    }
}


Question:
Which customers purchased Electronics?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Category": "Electronics"
    }
}


Question:
Which products were sold in South?

Output:

{
    "operation": "distinct",
    "column": "Product",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


Question:
What products are in Electronics?

Output:

{
    "operation": "distinct",
    "column": "Product",
    "group_by": null,
    "filters": {
        "Category": "Electronics"
    }
}


Question:
Which customers are from the North region?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Region": "North"
    }
}


IMPORTANT:

Do NOT use "count" for questions asking:

- Which customer
- Which customers
- Which product
- Which products
- What products
- What customers
- Which region
- Which category

Use "distinct" instead.


============================================================
COLUMN RULES
============================================================

The "column" must be one of the available
dataset columns.

For highest and lowest:

- column = numeric column being compared
- group_by = column whose value should be returned

Example:

Question:
Which product has the highest sales?

Output:

{
    "operation": "highest",
    "column": "Sales",
    "group_by": "Product",
    "filters": {}
}


============================================================
COUNT RULES
============================================================

Use "count" when the user asks HOW MANY
records, orders, customers, etc. exist.

Example:

Question:
How many orders are there?

Output:

{
    "operation": "count",
    "column": "Order_ID",
    "group_by": null,
    "filters": {}
}


Question:
How many orders are from North?

Output:

{
    "operation": "count",
    "column": "Order_ID",
    "group_by": null,
    "filters": {
        "Region": "North"
    }
}


============================================================
GROUPING RULES
============================================================

Use "group_sum" when the user asks for a total
broken down BY a group.

Example:

Question:
What are the sales by region?

Output:

{
    "operation": "group_sum",
    "column": "Sales",
    "group_by": "Region",
    "filters": {}
}


Use "group_average" when the user asks for an
average broken down BY a group.

Example:

Question:
What is the average profit by region?

Output:

{
    "operation": "group_average",
    "column": "Profit",
    "group_by": "Region",
    "filters": {}
}


Other phrases that indicate grouping include:

- by
- for each
- per


============================================================
FILTERED AVERAGE
============================================================

If the user asks for an average for a SPECIFIC
value, DO NOT use group_average.

Use:

"operation": "average"

and:

"group_by": null

Example:

Question:
What is the average profit in South?

Output:

{
    "operation": "average",
    "column": "Profit",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


============================================================
FILTERED MEDIAN
============================================================

If the user asks for a median for a SPECIFIC
value, use "median" with filters.

Example:

Question:
What is the median sales in South?

Output:

{
    "operation": "median",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


============================================================
FILTER RULES
============================================================

Filters must use actual values that exist
in the dataset.

Example:

Region:
South
North
West
East

Category:
Electronics
Furniture
Accessories

Customer:
ABC Ltd
XYZ Corp
Nova Pvt Ltd
Prime Stores
Tech World


Question:

What are the total sales in South?

Output:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


============================================================
MULTIPLE FILTERS
============================================================

Multiple filters are allowed.

Example:

Question:
What are the total sales for Electronics in South?

Output:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


Example:

Question:
Which customers purchased Electronics in South?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


Example:

Question:
What are the top 3 products by sales in South?

Output:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {
        "Region": "South"
    }
}


============================================================
NATURAL LANGUAGE
============================================================

Understand different ways users can ask
the same analytical question.

Example:

"What did we make from electronics in the south?"

means:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


"How much revenue came from South?"

means:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


"Show me the best 3 products by sales"

means:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


"Show me the worst 3 products by sales"

means:

{
    "operation": "bottom_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


============================================================
EXAMPLES
============================================================

Question:
What is the total sales?

Output:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {}
}


Question:
What is the average profit?

Output:

{
    "operation": "average",
    "column": "Profit",
    "group_by": null,
    "filters": {}
}


Question:
What is the median sales?

Output:

{
    "operation": "median",
    "column": "Sales",
    "group_by": null,
    "filters": {}
}


Question:
How many orders are there?

Output:

{
    "operation": "count",
    "column": "Order_ID",
    "group_by": null,
    "filters": {}
}


Question:
Which product has the highest sales?

Output:

{
    "operation": "highest",
    "column": "Sales",
    "group_by": "Product",
    "filters": {}
}


Question:
Which product has the lowest sales?

Output:

{
    "operation": "lowest",
    "column": "Sales",
    "group_by": "Product",
    "filters": {}
}


Question:
What are the top 3 products by sales?

Output:

{
    "operation": "top_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


Question:
What are the bottom 3 products by sales?

Output:

{
    "operation": "bottom_n",
    "column": "Sales",
    "group_by": "Product",
    "n": 3,
    "filters": {}
}


Question:
What are the sales by region?

Output:

{
    "operation": "group_sum",
    "column": "Sales",
    "group_by": "Region",
    "filters": {}
}


Question:
What is the average profit by region?

Output:

{
    "operation": "group_average",
    "column": "Profit",
    "group_by": "Region",
    "filters": {}
}


Question:
What are the total sales in South?

Output:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


Question:
What is the average profit in South?

Output:

{
    "operation": "average",
    "column": "Profit",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


Question:
What are the total sales for Electronics in South?

Output:

{
    "operation": "total",
    "column": "Sales",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


Question:
What is the average profit for Electronics in South?

Output:

{
    "operation": "average",
    "column": "Profit",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


Question:
Which customer purchased a Laptop?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Product": "Laptop"
    }
}


Question:
Which products were sold in South?

Output:

{
    "operation": "distinct",
    "column": "Product",
    "group_by": null,
    "filters": {
        "Region": "South"
    }
}


Question:
Which customers purchased Electronics in South?

Output:

{
    "operation": "distinct",
    "column": "Customer",
    "group_by": null,
    "filters": {
        "Category": "Electronics",
        "Region": "South"
    }
}


============================================================
FINAL RULES
============================================================

1. Return ONLY JSON.

2. Never return explanations.

3. Never return markdown.

4. Never return code fences.

5. Never calculate the answer.

6. Use only columns that exist in the dataset.

7. Use only filter values that exist in the dataset.

8. If the question asks for an average BY a group,
   use group_average.

9. If the question asks for an average for a
   specific value, use average with filters.

10. If the question asks for a median, use median.

11. If the question asks for a median for a
    specific value, use median with filters.

12. If the question asks for a total BY a group,
    use group_sum.

13. If the question asks for a total for a
    specific value, use total with filters.

14. If the question asks WHICH or WHAT values
    exist after filtering, use distinct.

15. If the question asks for TOP N groups,
    use top_n.

16. If the question asks for BOTTOM N groups,
    use bottom_n.

17. For top_n and bottom_n:
    - column = numeric metric
    - group_by = entity being ranked
    - n = requested number
    - default n = 5 if no number is specified

18. group_by must be null unless the user explicitly
    requests a grouped or ranked result.

19. filters must always be a JSON object.

20. Do NOT use count when the user asks "which"
    or "what" values.
"""

    # ========================================================
    # USER PROMPT
    # ========================================================

    user_prompt = f"""
Available dataset columns:

{columns}


Available dataset values:

{json.dumps(
    sample_values,
    indent=2,
    default=str
)}


User question:

{question}


Return ONLY the JSON analysis plan.
"""

    # ========================================================
    # CALL GROQ
    # ========================================================

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0
    )

    # ========================================================
    # GET RESPONSE
    # ========================================================

    content = (
        response
        .choices[0]
        .message
        .content
    )

    if not content:

        raise ValueError(
            "The analysis planner returned "
            "an empty response."
        )

    content = content.strip()

    # ========================================================
    # REMOVE MARKDOWN CODE FENCES
    # ========================================================

    if content.startswith("```"):

        content = (
            content
            .replace("```json", "")
            .replace("```JSON", "")
            .replace("```", "")
            .strip()
        )

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        plan = json.loads(
            content
        )

    except json.JSONDecodeError as error:

        raise ValueError(
            "Invalid JSON returned by "
            "analysis planner:\n"
            f"{content}"
        ) from error

    # ========================================================
    # VALIDATE REQUIRED KEYS
    # ========================================================

    required_keys = {
        "operation",
        "column",
        "group_by",
        "filters"
    }

    missing_keys = (
        required_keys
        - set(plan.keys())
    )

    if missing_keys:

        raise ValueError(
            "Analysis plan is missing "
            f"required keys: {missing_keys}"
        )

    # ========================================================
    # VALIDATE OPERATION
    # ========================================================

    allowed_operations = {
        "total",
        "average",
        "median",
        "count",
        "minimum",
        "maximum",
        "highest",
        "lowest",
        "distinct",
        "group_sum",
        "group_average",
        "top_n",
        "bottom_n"
    }

    operation = plan["operation"]

    if operation not in allowed_operations:

        raise ValueError(
            "Unsupported analysis operation: "
            f"{operation}"
        )

    # ========================================================
    # VALIDATE COLUMN
    # ========================================================

    column = plan["column"]

    if column not in columns:

        raise ValueError(
            "Invalid analysis column: "
            f"{column}"
        )

    # ========================================================
    # VALIDATE GROUP BY
    # ========================================================

    group_by = plan["group_by"]

    if group_by is not None:

        if group_by not in columns:

            raise ValueError(
                "Invalid group_by column: "
                f"{group_by}"
            )

    # ========================================================
    # VALIDATE FILTERS
    # ========================================================

    filters = plan["filters"]

    if not isinstance(
        filters,
        dict
    ):

        raise ValueError(
            "Analysis filters must be "
            "a JSON object."
        )

    for filter_column in filters:

        if filter_column not in columns:

            raise ValueError(
                "Invalid filter column: "
                f"{filter_column}"
            )

    # ========================================================
    # VALIDATE TOP/BOTTOM N
    # ========================================================

    if operation in {
        "top_n",
        "bottom_n"
    }:

        if "n" not in plan:

            plan["n"] = 5

        try:

            plan["n"] = int(
                plan["n"]
            )

        except (
            TypeError,
            ValueError
        ):

            raise ValueError(
                "The 'n' value for "
                f"{operation} must be an integer."
            )

        if plan["n"] < 1:

            raise ValueError(
                "The 'n' value must be "
                "at least 1."
            )

        if plan["n"] > 100:

            raise ValueError(
                "The 'n' value cannot be "
                "greater than 100."
            )

        if group_by is None:

            raise ValueError(
                f"{operation} requires "
                "a group_by column."
            )

    # ========================================================
    # REMOVE N FOR OTHER OPERATIONS
    # ========================================================

    if operation not in {
        "top_n",
        "bottom_n"
    }:

        plan.pop(
            "n",
            None
        )

    # ========================================================
    # RETURN PLAN
    # ========================================================

    print(
        "[DEBUG] Final analysis plan:"
    )

    print(
        plan
    )

    return plan