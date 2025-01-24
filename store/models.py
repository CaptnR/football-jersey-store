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
