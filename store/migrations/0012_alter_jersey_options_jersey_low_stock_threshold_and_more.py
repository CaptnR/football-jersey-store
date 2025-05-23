# Generated by Django 5.1.6 on 2025-02-19 08:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0011_remove_customization_design'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='jersey',
            options={'verbose_name_plural': 'Jerseys'},
        ),
        migrations.AddField(
            model_name='jersey',
            name='low_stock_threshold',
            field=models.IntegerField(default=100),
        ),
        migrations.AddField(
            model_name='jersey',
            name='stock',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='jersey',
            name='price',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]
