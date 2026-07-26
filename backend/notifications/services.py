from django.conf import settings
from django.core.mail import send_mail

from users.models import User


class NotificationService:

    @staticmethod
    def send_push_notification(user, title, body, data=None):
        # Firebase integration can be added later
        # from firebase_admin import messaging

        NotificationService._log_notification(
            "push",
            user,
            title,
            body,
            data,
        )

        return True


    @staticmethod
    def send_sms(user, body):
        account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
        auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")

        # If Twilio is not configured, only log notification
        if not account_sid or not auth_token:
            NotificationService._log_notification(
                "sms",
                user,
                "",
                body,
            )
            return True

        try:
            from twilio.rest import Client

            client = Client(
                account_sid,
                auth_token,
            )

            client.messages.create(
                body=body,
                from_=getattr(
                    settings,
                    "TWILIO_FROM_NUMBER",
                    "",
                ),
                to=getattr(
                    user,
                    "phone_number",
                    "",
                ),
            )

            NotificationService._log_notification(
                "sms",
                user,
                "",
                body,
            )

            return True

        except Exception as e:
            print("SMS Error:", e)
            return False


    @staticmethod
    def send_email(user, subject, body):
        from_email = getattr(
            settings,
            "DEFAULT_FROM_EMAIL",
            "no-reply@careconnect.local",
        )

        try:
            send_mail(
                subject,
                body,
                from_email,
                [user.email],
                fail_silently=True,
            )

            NotificationService._log_notification(
                "email",
                user,
                subject,
                body,
            )

            return True

        except Exception as e:
            print("Email Error:", e)
            return False


    @staticmethod
    def _log_notification(channel, user, title, body, data=None):
        from notifications.models import Notification

        Notification.objects.create(
            recipient=user,
            channel=channel,
            title=title or "",
            body=body or "",
            data=data or {},
        )


    @staticmethod
    def notify_guardians_about_sos(sos):
        from sos.models import SOS

        if not isinstance(sos, SOS):
            sos = (
                SOS.objects
                .select_related(
                    "resident",
                    "category",
                )
                .prefetch_related(
                    "resident__guardians",
                )
                .get(pk=sos)
            )

        resident = sos.resident

        # Guardian objects are fetched,
        # but Notification model accepts only User objects.
        guardians = list(
            resident.guardians.all()
        )

        security_users = list(
            User.objects.filter(
                role="security",
                is_verified=True,
            )
        )

        volunteer_users = list(
            User.objects.filter(
                role="volunteer",
                is_verified=True,
            )
        )

        # Current notification recipients
        recipients = (
            security_users
            + volunteer_users
            + [resident]
        )

        seen = set()

        subject = (
            f"Emergency SOS Alert - "
            f"{sos.category.name if sos.category else 'General'}"
        )

        body = (
            f"SOS triggered by {resident.email}.\n"
            f"Message: {sos.message or 'No additional message'}\n"
            f"Location: {sos.latitude}, {sos.longitude}"
        )

        for recipient in recipients:

            if recipient.id in seen:
                continue

            seen.add(recipient.id)

            NotificationService.send_push_notification(
                recipient,
                subject,
                body,
            )

            NotificationService.send_sms(
                recipient,
                body,
            )

            NotificationService.send_email(
                recipient,
                subject,
                body,
            )