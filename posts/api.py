from tastypie.resources import ModelResource
from posts.models import Post
from tastypie import fields, utils
from tastypie.authorization import Authorization
from django.contrib.auth.models import User
from tastypie.resources import ALL, ALL_WITH_RELATIONS


class UserResource(ModelResource):

    class Meta:
        queryset = User.objects.all()
        resource_name = 'author'
        excludes = [
            'email', 'password', 'is_active', 'is_staff', 'is_superuser']
        filtering = {
            'username': ALL,
        }


class PostResource(ModelResource):

    author = fields.ForeignKey(UserResource, 'author')

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
        authorization = Authorization()
