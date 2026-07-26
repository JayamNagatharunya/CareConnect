from django.urls import path
from .views import BlockDetailView, BlockListCreateView, FlatDetailView, FlatListCreateView, SocietyDetailView, SocietyListCreateView

urlpatterns = [
    path("societies/", SocietyListCreateView.as_view(), name="society-list-create"),
    path("societies/<int:pk>/", SocietyDetailView.as_view(), name="society-detail"),
    path("blocks/", BlockListCreateView.as_view(), name="block-list-create"),
    path("blocks/<int:pk>/", BlockDetailView.as_view(), name="block-detail"),
    path("flats/", FlatListCreateView.as_view(), name="flat-list-create"),
    path("flats/<int:pk>/", FlatDetailView.as_view(), name="flat-detail"),
]
