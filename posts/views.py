from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    # return HttpResponse("Nanu says WOLOLO")
    context_dict = {}
    return render(request, 'posts/index.html', context_dict)
# Create your views here.
