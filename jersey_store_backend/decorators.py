from functools import wraps
from rest_framework import status
from .utils import api_response

def validate_request_data(required_fields):
    def decorator(func):
        @wraps(func)
        def wrapper(view, request, *args, **kwargs):
            missing_fields = [
                field for field in required_fields 
                if field not in request.data
            ]
            if missing_fields:
                return api_response(
                    errors=f"Missing required fields: {', '.join(missing_fields)}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            return func(view, request, *args, **kwargs)
        return wrapper
    return decorator 