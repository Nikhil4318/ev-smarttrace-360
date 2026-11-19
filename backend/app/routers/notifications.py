from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.notifications import Notification
from app.schemas.dashboard import NotificationOut
from app.security.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    if not notifs:
        # Seed initial notifications
        n1 = Notification(
            user_id=current_user.id,
            title="Inverter Cooling Alert",
            message="Inverter thermal reading reached 68.4°C during peak acceleration. System recommends cooling inspection.",
            severity="warning",
            is_read=False
        )
        n2 = Notification(
            user_id=current_user.id,
            title="Optimal Off-Peak Charging",
            message="Off-peak electricity tariff begins at 11:00 PM ($0.18/kWh). Scheduled charging recommended.",
            severity="info",
            is_read=False
        )
        db.add_all([n1, n2])
        db.commit()
        notifs = db.query(Notification).filter(Notification.user_id == current_user.id).all()

    return notifs


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
