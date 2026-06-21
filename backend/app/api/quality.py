from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.quality import QualityRule
from app.schemas.quality import QualityRuleCreate, QualityRuleResponse

router = APIRouter()

@router.get("/", response_model=List[QualityRuleResponse])
def list_quality_rules(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    query = db.query(QualityRule)
    if dataset_id is not None:
        query = query.filter(QualityRule.dataset_id == dataset_id)
    return query.all()

@router.post("/", response_model=QualityRuleResponse, status_code=status.HTTP_201_CREATED)
def create_quality_rule(
    rule_in: QualityRuleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    new_rule = QualityRule(
        dataset_id=rule_in.dataset_id,
        field=rule_in.field,
        rule_type=rule_in.rule_type,
        parameters_json=rule_in.parameters_json,
        is_active=rule_in.is_active if rule_in.is_active is not None else True
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule

@router.post("/{rule_id}/run")
def run_quality_check(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    rule = db.query(QualityRule).filter(QualityRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Quality rule not found")
    
    # Simulate a validation check execution
    import random
    success = random.random() > 0.08 # 92% pass rate
    passed_rows = int(random.uniform(9000, 10000))
    failed_rows = 10000 - passed_rows if not success else 0
    
    return {
        "rule_id": rule_id,
        "status": "passed" if success else "failed",
        "records_tested": 10000,
        "records_passed": passed_rows,
        "records_failed": failed_rows,
        "execution_time_ms": round(random.uniform(50, 200), 2)
    }

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quality_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    rule = db.query(QualityRule).filter(QualityRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return None
