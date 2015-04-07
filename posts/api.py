from tastypie.resources import ModelResource
from posts.models import Post


class PostResource(ModelResource):
    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'