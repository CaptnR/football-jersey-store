from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from .constants import CURRENCY
from django.utils import timezone

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

class JerseyImage(models.Model):
    jersey = models.ForeignKey('Jersey', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='jersey_images/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', '-is_primary']

    def __str__(self):
        return f"Image for {self.jersey.player.name}'s Jersey"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Set all other images of this jersey to not primary
            JerseyImage.objects.filter(jersey=self.jersey).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)

class Jersey(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    number = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, default='')
    stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        verbose_name_plural = "Jerseys"

    def __str__(self):
        return f"{self.player.name}'s Jersey"

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()

    @property
    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold

    @property
    def sale_price(self):
        active_sales = Sale.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )
        
        applicable_sale = None
        for sale in active_sales:
            if sale.sale_type == 'ALL':
                applicable_sale = sale
            elif sale.sale_type == 'PLAYER':
                target_player_ids = [int(id) for id in sale.target_value.split(',') if id]
                if self.player.id in target_player_ids:
                    applicable_sale = sale
            elif sale.sale_type == 'TEAM':
                target_team_ids = [int(id) for id in sale.target_value.split(',') if id]
                if self.player.team.id in target_team_ids:
                    applicable_sale = sale
            elif sale.sale_type == 'LEAGUE':
                target_leagues = sale.target_value.split(',')
                if self.player.team.league in target_leagues:
                    applicable_sale = sale
            
            if applicable_sale:
                break
        
        if not applicable_sale:
            return None
            
        if applicable_sale.discount_type == 'FLAT':
            return max(0, float(self.price) - float(applicable_sale.discount_value))
        else:  # PERCENTAGE
            discount = (float(applicable_sale.discount_value) / 100) * float(self.price)
            return max(0, float(self.price) - discount)

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
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('return_requested', 'Return Requested'),
        ('return_approved', 'Return Approved'),
        ('return_rejected', 'Return Rejected'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    def save(self, *args, **kwargs):
        # Ensure status is always lowercase before saving
        if self.status:
            self.status = self.status.lower()
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    jersey = models.ForeignKey(Jersey, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=10)
    type = models.CharField(max_length=20, default='regular')
    player_name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        jersey_name = self.jersey.player.name if self.jersey else self.player_name
        return f"{self.quantity}x {jersey_name}'s Jersey (Size: {self.size})"

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'jersey')
        db_table = 'store_wishlist'

    def __str__(self):
        return f"{self.user.username}'s wishlist item: {self.jersey.player.name}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    jersey = models.ForeignKey(Jersey, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'jersey')

    def __str__(self):
        return f"{self.user.username}'s review of {self.jersey.player.name} jersey"

    def save(self, *args, **kwargs):
        if self.id:  # If review exists (being updated)
            self.is_edited = True
        super().save(*args, **kwargs)

class Sale(models.Model):
    SALE_TYPE_CHOICES = [
        ('PLAYER', 'Player'),
        ('TEAM', 'Team'),
        ('LEAGUE', 'League'),
        ('ALL', 'All Jerseys')
    ]

    DISCOUNT_TYPE_CHOICES = [
        ('FLAT', 'Flat Amount'),
        ('PERCENTAGE', 'Percentage')
    ]

    sale_type = models.CharField(max_length=10, choices=SALE_TYPE_CHOICES)
    target_value = models.CharField(max_length=100)  # Player name, team name, or league name
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_sale_type_display()} Sale - {self.target_value}"

class Return(models.Model):
    RETURN_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed')
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=RETURN_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Return for Order #{self.order.id} - {self.status}"

    class Meta:
        ordering = ['-created_at']

