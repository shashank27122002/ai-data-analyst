import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.models import Report, User
from database.postgres import get_db


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ReportCreate(BaseModel):
    dataset_id: int
    dataset_name: str
    question: str
    answer: str
    operation: str | None = None
    column: str | None = None
    group_by: str | None = None
    result: object | None = None


# ============================================================
# GET ALL REPORTS
# ============================================================

@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id
        )
        .order_by(
            Report.created_at.desc()
        )
        .all()
    )

    return {
        "reports": [
            {
                "id": report.id,
                "datasetId": report.dataset_id,
                "datasetName": report.dataset_name,
                "question": report.question,
                "answer": report.answer,
                "operation": report.operation,
                "column": report.column,
                "groupBy": report.group_by,
                "result": (
                    json.loads(report.result)
                    if report.result
                    else None
                ),
                "createdAt": report.created_at.isoformat(),
            }
            for report in reports
        ]
    }


# ============================================================
# SAVE REPORT
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = Report(
        user_id=current_user.id,
        dataset_id=report_data.dataset_id,
        dataset_name=report_data.dataset_name,
        question=report_data.question,
        answer=report_data.answer,
        operation=report_data.operation,
        column=report_data.column,
        group_by=report_data.group_by,
        result=(
            json.dumps(report_data.result)
            if report_data.result is not None
            else None
        ),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "datasetId": report.dataset_id,
        "datasetName": report.dataset_name,
        "question": report.question,
        "answer": report.answer,
        "operation": report.operation,
        "column": report.column,
        "groupBy": report.group_by,
        "result": report_data.result,
        "createdAt": report.created_at.isoformat(),
    }


# ============================================================
# DELETE ONE REPORT
# ============================================================

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id,
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {
        "message": "Report deleted successfully"
    }


# ============================================================
# DELETE ALL REPORTS
# ============================================================

@router.delete("/")
def clear_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted_count = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "message": "Reports cleared successfully",
        "deleted": deleted_count,
    }