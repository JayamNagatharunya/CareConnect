from django.urls import path
from .views import (
    EmergencyContactDetailView,
    EmergencyContactListCreateView,
    GuardianDetailView,
    GuardianListCreateView,
    RejectContactView,
    VerifyContactView,
)

urlpatterns = [
    path("guardians/", GuardianListCreateView.as_view(), name="guardian-list-create"),
    path("guardians/<int:pk>/", GuardianDetailView.as_view(), name="guardian-detail"),
    path("contacts/", EmergencyContactListCreateView.as_view(), name="emergency-contact-list-create"),
    path("contacts/<int:pk>/", EmergencyContactDetailView.as_view(), name="emergency-contact-detail"),
    path("contacts/<int:pk>/verify/", VerifyContactView.as_view(), name="emergency-contact-verify"),
    path("contacts/<int:pk>/reject/", RejectContactView.as_view(), name="emergency-contact-reject"),
]
