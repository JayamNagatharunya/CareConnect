from rest_framework import serializers
from .models import EmergencyContact, Guardian


class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = ("id", "resident", "name", "relation", "phone_number", "email", "address", "is_primary", "is_verified", "created_at")
        read_only_fields = ("id", "created_at", "resident")


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ("id", "resident", "name", "phone_number", "email", "relation", "verification_status", "is_active", "created_at")
        read_only_fields = ("id", "created_at", "resident")
