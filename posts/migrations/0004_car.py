# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_carmanufacturer'),
    ]

    operations = [
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('model', models.CharField(max_length=200, help_text='model: ')),
                ('fabrication_date', models.DateField(help_text='fabrication_date: ')),
                ('description', models.TextField(help_text='Description: ')),
                ('manufacturer', models.ForeignKey(help_text='manufacturer', to='posts.CarManufacturer')),
            ],
            options={
                'verbose_name': 'Car',
                'verbose_name_plural': 'Car',
            },
            bases=(models.Model,),
        ),
    ]
