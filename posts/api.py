from tastypie.resources import ModelResource
from posts.models import Post, CarManufacturer, Car
from tastypie import fields
from tastypie.authorization import Authorization
from django.contrib.auth.models import User
from tastypie.resources import ALL


class UserResource(ModelResource):

    class Meta:
        queryset = User.objects.all()
        resource_name = 'author'
        excludes = [
            'password', 'is_active', 'is_staff', 'is_superuser']
        filtering = {
            'username': ALL,
        }
        authorization = Authorization()
        always_return_data = True


class PostResource(ModelResource):

    author = fields.ForeignKey(UserResource, 'author')

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
        authorization = Authorization()
        always_return_data = True

    def build_schema(self):
        base_schema = super(ModelResource, self).build_schema()
        base_schema['fields']['author']['resource'] = "/posts/api/v1/author/"
        return base_schema


class ManufacturerResource(ModelResource):

    class Meta:
        queryset = CarManufacturer.objects.all()
        resource_name = 'manufacturer'
        authorization = Authorization()
        always_return_data = True


class CarResource(ModelResource):

    manufacturer = fields.ForeignKey(ManufacturerResource, 'manufacturer')

    class Meta:
        queryset = Car.objects.all()
        resource_name = 'car'
        authorization = Authorization()
        always_return_data = True

    def build_schema(self):
        base_schema = super(ModelResource, self).build_schema()
        base_schema['fields']['manufacturer']['resource'] = "/posts/api/v2/manufacturer/"
        return base_schema