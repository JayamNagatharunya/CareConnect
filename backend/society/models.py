from django.db import models


class Society(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Block(models.Model):
    society = models.ForeignKey(Society, related_name="blocks", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("society", "code")

    def __str__(self):
        return f"{self.society.name} - {self.name}"


class Flat(models.Model):
    block = models.ForeignKey(Block, related_name="flats", on_delete=models.CASCADE)
    flat_number = models.CharField(max_length=20)
    floor = models.IntegerField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("block", "flat_number")

    def __str__(self):
        return f"{self.block} - {self.flat_number}"
