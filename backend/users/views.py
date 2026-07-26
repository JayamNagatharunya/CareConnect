from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ResidentProfile, User
from .serializers import RegisterSerializer, ResidentProfileSerializer, UserSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["email"] = self.user.email
        data["user_id"] = self.user.id
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "password", "password2", "role", "phone_number")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ResidentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ResidentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = ResidentProfile.objects.get_or_create(user=self.request.user)
        return profile


class ResidentApprovalListView(generics.ListAPIView):
    serializer_class = ResidentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ResidentProfile.objects.filter(approval_status="pending")


class ResidentApprovalActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        action = request.data.get("action")
        if action not in ("approve", "reject"):
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = ResidentProfile.objects.get(pk=pk)
        except ResidentProfile.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        profile.approval_status = "approved" if action == "approve" else "rejected"
        profile.approved_by = request.user
        from django.utils import timezone
        profile.approved_at = timezone.now()
        profile.rejection_reason = request.data.get("reason", "")
        profile.save(update_fields=["approval_status", "approved_by", "approved_at", "rejection_reason"])
        return Response(ResidentProfileSerializer(profile).data, status=status.HTTP_200_OK)


class ResidentDirectoryView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(role="resident")
        society_id = self.request.query_params.get("society_id")
        if society_id:
            queryset = queryset.filter(resident_profile__flat__block__society_id=society_id, resident_profile__approval_status="approved")
        return queryset
