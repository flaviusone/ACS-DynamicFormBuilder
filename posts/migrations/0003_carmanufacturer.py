# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0002_auto_20150611_1942'),
    ]

    operations = [
        migrations.CreateModel(
            name='CarManufacturer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, primary_key=True, auto_created=True)),
                ('name', models.CharField(help_text='Name: ', max_length=200)),
                ('founded', models.DateField(help_text='Founded: ')),
                ('headquartered', models.CharField(help_text='Headquarters: ', max_length=200)),
                ('description', models.TextField(help_text='Description: ')),
            ],
            options={
                'verbose_name': 'CarManufacturer',
                'verbose_name_plural': 'CarManufacturers',
            },
            bases=(models.Model,),
        ),
    ]
