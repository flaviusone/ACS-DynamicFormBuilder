from django.db import models
from django.contrib.auth.models import User


class Post(models.Model):
    title = models.CharField(max_length=200, help_text='Title: ')
    author = models.ForeignKey(User, help_text='User')
    created_at = models.DateTimeField(
        auto_now_add=True, help_text='Created at: ')
    content = models.TextField(help_text='Content: ')

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __unicode__(self):
        return self.title

    def __str__(self):
        return self.title

    # def save(self):
        # return super(Post, self).save(*args, **kwargs)

    # @models.permalink
    # def get_absolute_url(self):
    #     return ('')

    # TODO: Define custom methods here


class CarManufacturer(models.Model):
    name = models.CharField(max_length=200, help_text='Name: ')
    founded = models.DateField(help_text='Founded: ')
    headquartered = models.CharField(
        max_length=200, help_text='Headquarters: ')
    description = models.TextField(help_text='Description: ')

    class Meta:
        verbose_name = "CarManufacturer"
        verbose_name_plural = "CarManufacturers"

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name

class Car(models.Model):
    model = models.CharField(max_length=200, help_text='model: ')
    manufacturer = models.ForeignKey(CarManufacturer, help_text='manufacturer')
    fabrication_date = models.DateField(help_text='fabrication_date: ')
    description = models.TextField(help_text='Description: ')

    class Meta:
        verbose_name = "Car"
        verbose_name_plural = "Car"

    def __unicode__(self):
        return self.model

    def __str__(self):
        return self.model


