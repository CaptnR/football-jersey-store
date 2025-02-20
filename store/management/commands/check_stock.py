from django.core.management.base import BaseCommand
from store.models import Jersey

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        jerseys = Jersey.objects.all()
        self.stdout.write(f"Total jerseys: {jerseys.count()}")
        
        for jersey in jerseys:
            self.stdout.write(
                f"Jersey ID: {jersey.id}, "
                f"Player: {jersey.player.name}, "
                f"Stock: {jersey.stock}, "
                f"Threshold: {jersey.low_stock_threshold}"
            ) 