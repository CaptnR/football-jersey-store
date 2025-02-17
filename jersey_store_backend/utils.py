from rest_framework.response import Response
from rest_framework import status

def api_response(data=None, message=None, errors=None, status_code=status.HTTP_200_OK):
    response_data = {
        'success': status.is_success(status_code),
        'message': message,
        'data': data,
        'errors': errors
    }
    return Response(response_data, status=status_code) 