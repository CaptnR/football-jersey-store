# Create a management command: store/management/commands/update_jersey_ratings.py

from django.core.management.base import BaseCommand
from store.models import Jersey

class Command(BaseCommand):
    help = 'Updates jersey rating statistics'

    def handle(self, *args, **kwargs):
        jerseys = Jersey.objects.all()
        for jersey in jerseys:
            jersey.update_rating_stats()
        self.stdout.write(self.style.SUCCESS('Successfully updated jersey ratings'))