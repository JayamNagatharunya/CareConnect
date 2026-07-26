from django.core.management.base import BaseCommand
from users.models import User, ResidentProfile
from society.models import Society, Block, Flat
from sos.models import EmergencyCategory
from escalation.models import ResponseTimeConfig
from emergency.models import Guardian, EmergencyContact


class Command(BaseCommand):
    help = "Seed initial data for CareConnect"

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            email="admin@careconnect.local",
            defaults={"role": "admin", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin@careconnect.local / admin123"))

        categories = [
            ("Medical Emergency", "health-related emergencies"),
            ("Fire", "fire incidents"),
            ("Security Threat", "security threats"),
            ("Natural Disaster", "natural disasters"),
            ("Other", "other emergencies"),
        ]
        for name, desc in categories:
            _, created = EmergencyCategory.objects.get_or_create(name=name, defaults={"description": desc})
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {name}"))

        for role, window in [("guardian", 5), ("security", 3), ("volunteer", 10)]:
            _, created = ResponseTimeConfig.objects.get_or_create(role=role, defaults={"response_window_minutes": window})
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created response config for {role}"))

        society, _ = Society.objects.get_or_create(name="Sunrise Apartments", defaults={"address": "123 Main St", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"})
        if _:
            self.stdout.write(self.style.SUCCESS("Created society: Sunrise Apartments"))

        block, _ = Block.objects.get_or_create(society=society, name="Tower A", code="TA")
        if _:
            self.stdout.write(self.style.SUCCESS("Created block: Tower A"))

        flat, _ = Flat.objects.get_or_create(block=block, flat_number="101", defaults={"floor": 1})
        if _:
            self.stdout.write(self.style.SUCCESS("Created flat: 101"))

        resident, created = User.objects.get_or_create(
            email="resident@careconnect.local",
            defaults={"role": "resident", "phone_number": "9876543210", "is_verified": True},
        )
        if created:
            resident.set_password("resident123")
            resident.save()
            ResidentProfile.objects.get_or_create(user=resident, defaults={"flat": flat, "approval_status": "approved", "approved_by": admin})
            self.stdout.write(self.style.SUCCESS("Created resident: resident@careconnect.local / resident123"))

        guardian, created = Guardian.objects.get_or_create(
            resident=resident,
            phone_number="9876543211",
            defaults={"name": "John Doe", "relation": "parent", "is_primary": True, "is_verified": True},
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created guardian: John Doe"))

        contact, created = EmergencyContact.objects.get_or_create(
            resident=resident,
            phone_number="9876543212",
            defaults={"name": "Jane Doe", "relation": "friend", "verification_status": "verified"},
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created emergency contact: Jane Doe"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
