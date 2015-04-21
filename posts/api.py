from tastypie.resources import ModelResource
from posts.models import Post
from tastypie import fields, utils


class PostResource(ModelResource):

    author = fields.CharField(attribute='author')

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
