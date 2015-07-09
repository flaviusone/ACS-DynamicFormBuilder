from django.contrib import admin
from posts.models import Post, CarManufacturer, Car
# Register your models here.


class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')


class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ('name', 'founded', 'headquartered')

class CarAdmin(admin.ModelAdmin):
    list_display = ('model', 'manufacturer')

admin.site.register(Post, PostAdmin)
admin.site.register(CarManufacturer, ManufacturerAdmin)
admin.site.register(Car, CarAdmin)
