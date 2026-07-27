from rest_framework import serializers


class DashboardSummarySerializer(serializers.Serializer):
    total_sos = serializers.IntegerField()
    pending_sos = serializers.IntegerField()
    acknowledged_sos = serializers.IntegerField()
    resolved_sos = serializers.IntegerField()
    cancelled_sos = serializers.IntegerField()
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()