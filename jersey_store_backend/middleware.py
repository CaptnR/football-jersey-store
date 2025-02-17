import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        logger.info(f"Request: {request.method} {request.path}")
        if request.body:
            try:
                logger.info(f"Request body: {json.loads(request.body)}")
            except json.JSONDecodeError:
                logger.info(f"Request body: {request.body}")

    def process_response(self, request, response):
        logger.info(f"Response status: {response.status_code}")
        return response 