from django.contrib import admin
from .models import Team, Player, Jersey, Customization, Sale, JerseyImage

admin.site.register(Team)
admin.site.register(Player)

class JerseyImageInline(admin.TabularInline):
    model = JerseyImage
    extra = 1
    fields = ['image', 'is_primary', 'order']

@admin.register(Jersey)
class JerseyAdmin(admin.ModelAdmin):
    list_display = ['player', 'price', 'stock', 'is_low_stock']
    search_fields = ['player__name', 'player__team__name']
    list_filter = ['player__team__league']
    inlines = [JerseyImageInline]

admin.site.register(Customization)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_type', 'target_value', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active')
    list_filter = ('sale_type', 'discount_type', 'is_active')
    search_fields = ('target_value',)
    ordering = ('-created_at',)
