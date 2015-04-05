from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("Nanu says WOLOLO")
# Create your views here.
