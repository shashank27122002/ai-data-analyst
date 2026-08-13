from analysis.analysis_planner import (
    create_analysis_plan
)

from analysis.plan_executor import (
    execute_analysis_plan
)

from analysis.answer_formatter import (
    format_analysis_result
)


def analyze_question(
    question: str,
    dataframe
) -> dict:
    """
    Complete analytical workflow.

    1. Build dataset metadata
    2. Create analysis plan
    3. Execute exact calculation
    4. Format result for the LLM
    """

    # -----------------------------------------
    # Dataset columns
    # -----------------------------------------

    columns = dataframe.columns.tolist()

    # -----------------------------------------
    # Dataset values
    # -----------------------------------------

    sample_values = {}

    for column in dataframe.columns:

        values = (
            dataframe[column]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        sample_values[column] = values

    # -----------------------------------------
    # Create analysis plan
    # -----------------------------------------

    plan = create_analysis_plan(
        question=question,
        columns=columns,
        sample_values=sample_values
    )

    # -----------------------------------------
    # Execute plan
    # -----------------------------------------

    execution = execute_analysis_plan(
        plan=plan,
        dataframe=dataframe
    )

    # -----------------------------------------
    # Format result
    # -----------------------------------------

    formatted_result = (
        format_analysis_result(
            execution
        )
    )

    # -----------------------------------------
    # Return complete result
    # -----------------------------------------

    return {
        "question": question,
        "plan": plan,
        "execution": execution,
        "formatted_result": formatted_result
    }