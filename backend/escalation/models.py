from django.db import models
from users.models import User
from sos.models import SOS


class ResponseTimeConfig(models.Model):
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    response_window_minutes = models.IntegerField(default=5)
    auto_escalate = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.role} - {self.response_window_minutes} min"


class EscalationLog(models.Model):
    sos = models.ForeignKey(SOS, related_name="escalation_logs", on_delete=models.CASCADE)
    from_role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    to_role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    reason = models.TextField()
    triggered_at = models.DateTimeField(auto_now_add=True)
    triggered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Escalation for {self.sos} from {self.from_role} to {self.to_role}"
