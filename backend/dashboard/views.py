from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from sos.models import SOS
from notifications.models import Notification


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response({
            "total_sos": SOS.objects.count(),
            "pending_sos": SOS.objects.filter(status="pending").count(),
            "acknowledged_sos": SOS.objects.filter(status="acknowledged").count(),
            "resolved_sos": SOS.objects.filter(status="resolved").count(),
            "cancelled_sos": SOS.objects.filter(status="cancelled").count(),
            "total_notifications": Notification.objects.count(),
            "unread_notifications": Notification.objects.filter(
                is_read=False
            ).count(),
        })