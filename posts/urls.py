from django.conf.urls import patterns, include, url
from posts import views
from posts.api import PostResource

post_resource = PostResource()

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^api/', include(post_resource.urls)),
)