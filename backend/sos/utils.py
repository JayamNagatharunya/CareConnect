from geopy.geocoders import Nominatim


def get_address(latitude, longitude):
    try:
        geolocator = Nominatim(user_agent="care_connect")
        location = geolocator.reverse(f"{latitude}, {longitude}")

        if location:
            return location.address

        return ""

    except Exception:
        return ""