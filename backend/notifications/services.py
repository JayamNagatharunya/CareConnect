from django.conf import settings
from django.core.mail import send_mail
from users.models import User


class NotificationService:
    @staticmethod
    def send_push_notification(user, title, body, data=None):
        from firebase_admin import messaging
        device_tokens = []
        NotificationService._log_notification("push", user, title, body, data)
        return True

    @staticmethod
    def send_sms(user, body):
        account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
        auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
        if not account_sid or not auth_token:
            NotificationService._log_notification("sms", user, "", body)
            return True
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            client.messages.create(body=body, from_=getattr(settings, "TWILIO_FROM_NUMBER", ""), to=getattr(user, "phone_number", ""))
            NotificationService._log_notification("sms", user, "", body)
            return True
        except Exception:
            return False

    @staticmethod
    def send_email(user, subject, body):
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@careconnect.local")
        try:
            send_mail(subject, body, from_email, [user.email], fail_silently=True)
            NotificationService._log_notification("email", user, subject, body)
            return True
        except Exception:
            return False

    @staticmethod
    def _log_notification(channel, user, title, body, data=None):
        from notifications.models import Notification
        Notification.objects.create(recipient=user, channel=channel, title=title or "", body=body or "", data=data or {})

    @staticmethod
    def notify_guardians_about_sos(sos):
        from sos.models import SOS
        if not isinstance(sos, SOS):
            sos = SOS.objects.select_related("resident").prefetch_related("resident__guardians").get(pk=sos)
        resident = sos.resident
        guardians = getattr(resident, "guardians", None)
        if guardians is None:
            guardians = resident.guardians.all()
        guardians = list(guardians)

security_users = list(
    User.objects.filter(role="security", is_verified=True)
)

volunteer_users = list(
    User.objects.filter(role="volunteer", is_verified=True)
)

recipients = guardians + security_users + volunteer_users + [resident]
unique_recipients = []

seen = set()

for user in recipients:
    if user.id not in seen:
        seen.add(user.id)
        unique_recipients.append(user)
        subject = f"Emergency SOS Alert - {sos.category.name if sos.category else 'General'}"
        body = f"SOS triggered by {resident.email} at {sos.created_at}. Message: {sos.message or 'No additional message'} Location: {sos.latitude}, {sos.longitude}" if sos.latitude or sos.longitude else f"SOS triggered by {resident.email} at {sos.created_at}. Message: {sos.message or 'No additional message'}"
        for recipient in unique_recipients:
            NotificationService.send_push_notification(recipient, subject, body)
            NotificationService.send_sms(recipient, body)
            NotificationService.send_email(recipient, subject, body)
