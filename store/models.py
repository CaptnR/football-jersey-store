from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

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
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='', blank=True, null=True)  # Save files directly in 'jerseys/'

    def get_image_url(self):
        return f"{settings.MEDIA_URL}{self.image}" if self.image and self.image.name else settings.DEFAULT_JERSEY_IMAGE

class Customization(models.Model):
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=2)
    design = models.TextField()

    def __str__(self):
        return f"Customization for {self.jersey.player.name}"
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)  # Link to the user
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # Total price
    created_at = models.DateTimeField(auto_now_add=True)  # Order creation time
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')  # Order status

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
    
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")  # Link to the order
    name_on_card = models.CharField(max_length=255)  # Cardholder name
    card_number = models.CharField(max_length=16)  # Card number (dummy, not encrypted for this example)
    expiration_date = models.CharField(max_length=5)  # MM/YY
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"Payment for Order {self.order.id}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Tie wishlist to a user
    jersey = models.ForeignKey('Jersey', on_delete=models.CASCADE)  # Tie to a jersey
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'jersey')  # Prevent duplicate entries in the wishlist

    def __str__(self):
        return f"{self.user.username}'s wishlist item: {self.jersey.player.name}"

class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    jersey = models.ForeignKey('Jersey', on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'jersey')  # One review per jersey per user
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s review of {self.jersey.player.name} jersey"

