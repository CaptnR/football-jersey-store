from django.contrib import admin
from .models import Team, Player, Jersey, Customization, Sale

admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Jersey)
admin.site.register(Customization)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_type', 'target_value', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active')
    list_filter = ('sale_type', 'discount_type', 'is_active')
    search_fields = ('target_value',)
    ordering = ('-created_at',)
