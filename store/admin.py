from django.contrib import admin
from .models import Team, Player, Jersey, Customization

admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Jersey)
admin.site.register(Customization)
