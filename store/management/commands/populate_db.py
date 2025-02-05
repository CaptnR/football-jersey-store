from django.core.management.base import BaseCommand
from store.models import Team, Player, Jersey
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with initial data'

    def handle(self, *args, **kwargs):
        # Create Teams
        teams_data = [
            {"name": "Manchester United", "league": "Premier League"},
            {"name": "Real Madrid", "league": "La Liga"},
            {"name": "Bayern Munich", "league": "Bundesliga"},
            {"name": "Paris Saint-Germain", "league": "Ligue 1"},
            {"name": "Manchester City", "league": "Premier League"},
            {"name": "Barcelona", "league": "La Liga"},
            {"name": "Liverpool", "league": "Premier League"},
            {"name": "Juventus", "league": "Serie A"}
        ]

        teams = {}
        for team_data in teams_data:
            team = Team.objects.create(**team_data)
            teams[team.name] = team

        # Create Players
        players_data = [
            {"name": "Marcus Rashford", "team": "Manchester United"},
            {"name": "Bruno Fernandes", "team": "Manchester United"},
            {"name": "Jude Bellingham", "team": "Real Madrid"},
            {"name": "Vinicius Jr", "team": "Real Madrid"},
            {"name": "Harry Kane", "team": "Bayern Munich"},
            {"name": "Kylian Mbappe", "team": "Paris Saint-Germain"},
            {"name": "Erling Haaland", "team": "Manchester City"},
            {"name": "Robert Lewandowski", "team": "Barcelona"},
            {"name": "Mohamed Salah", "team": "Liverpool"},
            {"name": "Federico Chiesa", "team": "Juventus"}
        ]

        players = {}
        for player_data in players_data:
            team_name = player_data.pop("team")
            player = Player.objects.create(team=teams[team_name], **player_data)
            players[player.name] = player

        # Create Jerseys
        jerseys_data = [
            {"player": "Marcus Rashford", "price": Decimal("89.99")},
            {"player": "Bruno Fernandes", "price": Decimal("89.99")},
            {"player": "Jude Bellingham", "price": Decimal("89.99")},
            {"player": "Vinicius Jr", "price": Decimal("89.99")},
            {"player": "Harry Kane", "price": Decimal("89.99")},
            {"player": "Kylian Mbappe", "price": Decimal("89.99")},
            {"player": "Erling Haaland", "price": Decimal("89.99")},
            {"player": "Robert Lewandowski", "price": Decimal("89.99")},
            {"player": "Mohamed Salah", "price": Decimal("89.99")},
            {"player": "Federico Chiesa", "price": Decimal("89.99")}
        ]

        for jersey_data in jerseys_data:
            player_name = jersey_data.pop("player")
            Jersey.objects.create(player=players[player_name], **jersey_data)

        self.stdout.write(self.style.SUCCESS('Successfully populated database')) 