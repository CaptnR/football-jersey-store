from django.db import models
from django.contrib.auth.models import User

class Customization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    jersey = models.ForeignKey('Jersey', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=2)
    design = models.TextField()
    primary_color = models.CharField(max_length=50)
    secondary_color = models.CharField(max_length=50)
    size = models.CharField(max_length=2, choices=[
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large')
    ], default='M')
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Customization by {self.user.username} - {self.jersey.name}" 