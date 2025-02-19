from django.core.management.base import BaseCommand
from store.models import Jersey

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Update some jerseys to have low stock
        jerseys = Jersey.objects.all()[:3]  # Get first 3 jerseys
        for idx, jersey in enumerate(jerseys):
            jersey.stock = 50  # Set low stock
            jersey.low_stock_threshold = 100
            jersey.save()
            self.stdout.write(f'Updated jersey {jersey.id} with low stock') 