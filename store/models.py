from django.db import models
from django.conf import settings

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
        # Generate full URL for the image
        if self.image:
            return f"{settings.MEDIA_URL}{self.image.name}"  # Cleanly append MEDIA_URL and image name
        return None

class Customization(models.Model):
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=2)
    design = models.TextField()

    def __str__(self):
        return f"Customization for {self.jersey.player.name}"
    
class Order(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)  # Link to user
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # Total price
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp
    status = models.CharField(max_length=20, default='Pending')  # Order status

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

