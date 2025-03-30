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
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
        ('XXXL', 'Triple Extra Large')
    ]
    size = models.CharField(
        max_length=4,
        choices=SIZE_CHOICES,
        default='M'
    )
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Customization by {self.user.username} - {self.jersey.name}"

class OrderItem(models.Model):
    order = models.ForeignKey('Order', related_name='items', on_delete=models.CASCADE)
    jersey = models.ForeignKey('Jersey', on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(
        max_length=4,
        choices=[
            ('XS', 'Extra Small'),
            ('S', 'Small'),
            ('M', 'Medium'),
            ('L', 'Large'),
            ('XL', 'Extra Large'),
            ('XXL', 'Double Extra Large'),
            ('XXXL', 'Triple Extra Large')
        ],
        default='M'
    )
    type = models.CharField(max_length=10, choices=[
        ('regular', 'Regular'),
        ('custom', 'Custom')
    ], default='regular')
    player_name = models.CharField(max_length=100, blank=True)  # For displaying jersey player name

    def __str__(self):
        return f"{self.quantity}x {self.jersey.name} (Size: {self.size})"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}" 