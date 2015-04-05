from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Post(models.Model):
    # TODO: Define fields here
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User)
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()


    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    # def __str__(self):
    #     pass

    # def save(self):
    #     pass

    # @models.permalink
    # def get_absolute_url(self):
    #     return ('')

    # TODO: Define custom methods here
