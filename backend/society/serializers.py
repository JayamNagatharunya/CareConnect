from rest_framework import serializers
from .models import Society, Block, Flat


class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = ("id", "block", "flat_number", "floor", "is_available", "created_at")
        read_only_fields = ("id", "created_at")


class BlockSerializer(serializers.ModelSerializer):
    flats = FlatSerializer(many=True, read_only=True)

    class Meta:
        model = Block
        fields = ("id", "society", "name", "code", "flats", "created_at")
        read_only_fields = ("id", "created_at")


class SocietySerializer(serializers.ModelSerializer):
    blocks = BlockSerializer(many=True, read_only=True)

    class Meta:
        model = Society
        fields = ("id", "name", "address", "city", "state", "pincode", "is_active", "blocks", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class BlockCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ("id", "society", "name", "code")
        read_only_fields = ("id",)


class FlatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = ("id", "block", "flat_number", "floor", "is_available")
        read_only_fields = ("id",)
