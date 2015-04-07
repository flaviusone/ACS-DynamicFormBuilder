from django.conf.urls import patterns, include, url
from django.contrib import admin
from posts import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^posts/', include('posts.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
