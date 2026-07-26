from celery import shared_task

from escalation.models import EscalationLog
from notifications.services import NotificationService
from sos.models import SOS
from users.models import User


@shared_task
def auto_escalate_sos(sos_id):
    try:
        sos = SOS.objects.get(pk=sos_id)
    except SOS.DoesNotExist:
        return

    # Don't escalate if already resolved
    if sos.status.lower() == "resolved":
        return

    # Find security and volunteer users
    security_users = User.objects.filter(role="security", is_verified=True)
    volunteer_users = User.objects.filter(role="volunteer", is_verified=True)

    # Create escalation log
    EscalationLog.objects.create(
        sos=sos,
        from_role="guardian",
        to_role="security",
        reason="No response from guardian within response window",
    )

    # Notify security
    for user in security_users:
        NotificationService.send_push_notification(
            user,
            "SOS Escalated",
            f"SOS from {sos.resident.email} requires attention."
        )

    # Notify volunteers
    for user in volunteer_users:
        NotificationService.send_push_notification(
            user,
            "SOS Escalated",
            f"SOS from {sos.resident.email} requires attention."
        )