from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Team(models.Model):
    name = models.CharField(max_length=100)
    league = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='team_logos')

    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Jersey(models.Model):
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Increased max_digits for INR
    image = models.ImageField(upload_to='', blank=True, null=True)

    class Meta:
        verbose_name_plural = "Jerseys"

    def __str__(self):
        return f"{self.player.name}'s Jersey - {CURRENCY.symbol}{self.price}"

class Customization(models.Model):
    JERSEY_TYPE_CHOICES = [
        ('custom', 'Custom Jersey'),
        ('existing', 'Existing Jersey')
    ]
    
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE, null=True, blank=True)
    jersey_type = models.CharField(max_length=10, choices=JERSEY_TYPE_CHOICES, default='custom')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=2)
    primary_color = models.CharField(max_length=7, default='#000000')
    secondary_color = models.CharField(max_length=7, default='#FFFFFF')
    size = models.CharField(max_length=2, default='M')
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.jersey:
            return f"Customization of {self.jersey.player.name} jersey by {self.user.username}"
        return f"Custom jersey by {self.user.username}"
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    items = models.JSONField()  # This stores the cart items
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
    
    def save(self, *args, **kwargs):
        # Ensure status is always lowercase before saving
        if self.status:
            self.status = self.status.lower()
        super().save(*args, **kwargs)

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")  # Link to the order
    name_on_card = models.CharField(max_length=255)  # Cardholder name
    card_number = models.CharField(max_length=16)  # Card number (dummy, not encrypted for this example)
    expiration_date = models.CharField(max_length=5)  # MM/YY
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"Payment for Order {self.order.id}"

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE, related_name='wishlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'jersey')
        db_table = 'store_wishlist'

    def __str__(self):
        return f"{self.user.username}'s wishlist item: {self.jersey.player.name}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'jersey')  # Ensure one review per user per jersey

    def __str__(self):
        return f"{self.user.username}'s review of {self.jersey.player.name} jersey"

