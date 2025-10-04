from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize OAuth instance
oauth = OAuth()

# Register Auth0 OAuth client
oauth.register(
    name="auth0",
    client_id=os.getenv("AUTH0_CLIENT_ID"),
    client_secret=os.getenv("AUTH0_CLIENT_SECRET"),
    server_metadata_url=f'https://{os.getenv("AUTH0_DOMAIN")}/.well-known/openid-configuration',
    client_kwargs={
        "scope": "openid profile email",
    },
)

