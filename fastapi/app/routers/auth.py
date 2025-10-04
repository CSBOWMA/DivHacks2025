from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from app.auth0 import oauth
from dotenv import load_dotenv
from pydantic import BaseModel
import httpx
import os

load_dotenv()

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str


# Direct API login using Auth0 (no browser redirects)
@router.post("/api/login")
async def api_login(credentials: LoginRequest, request: Request):
    """Direct API login using Auth0's Resource Owner Password Grant"""
    try:
        domain = os.getenv("AUTH0_DOMAIN")
        client_id = os.getenv("AUTH0_CLIENT_ID")
        client_secret = os.getenv("AUTH0_CLIENT_SECRET")
        audience = os.getenv("AUTH0_AUDIENCE", f"https://{domain}/api/v2/")
        
        # Call Auth0's token endpoint directly
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://{domain}/oauth/token",
                json={
                    "grant_type": "password",
                    "username": credentials.username,
                    "password": credentials.password,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "audience": audience,
                    "scope": "openid profile email"
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid username or password"
                )
            
            token_data = response.json()
            access_token = token_data.get("access_token")
            
            # Get user info from Auth0
            user_response = await client.get(
                f"https://{domain}/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to get user info")
            
            user_info = user_response.json()
            
            # Store in session
            request.session["user"] = user_info
            request.session["access_token"] = access_token
            
            return {
                "success": True,
                "message": "Login successful",
                "user": user_info,
                "access_token": access_token
            }
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Auth0 connection error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/login")
async def login(request: Request):
    """Initiate OAuth login flow (for browser-based authentication)"""
    redirect_uri = os.getenv("AUTH0_REDIRECT_URI", "http://localhost:8000/callback")
    return await oauth.auth0.authorize_redirect(request, redirect_uri)

# handles the callback from auth0's login page
# stores the user info in the session
# redirects to the profile page
@router.get("/callback")
async def callback(request: Request):
    """Handle OAuth callback"""
    try:
        token = await oauth.auth0.authorize_access_token(request)
        user = await oauth.auth0.parse_id_token(request, token)

        # Store user info in session
        request.session["user"] = user
        request.session["access_token"] = token.get("access_token")

        return RedirectResponse(url="/profile")

    except Exception as e:
        return RedirectResponse(url="/login?error=auth_failed")

# logs out the user and clears the session
@router.get("/logout")
async def logout(request: Request):
    """Logout user and clear session"""

    # clears the session
    request.session.pop("user", None)

    # clears the access token
    request.session.pop("access_token", None)

    # Redirect to Auth0 logout
    domain = os.getenv("AUTH0_DOMAIN")
    client_id = os.getenv("AUTH0_CLIENT_ID")
    logout_redirect_uri = os.getenv("AUTH0_LOGOUT_REDIRECT_URI", "http://localhost:8000/")

    return RedirectResponse(
        url=f"https://{domain}/v2/logout?client_id={client_id}&returnTo={logout_redirect_uri}"
    )

@router.get("/profile")
async def profile(request: Request):
    """Get user profile (protected route) - Browser session based"""
    user = request.session.get("user")
    if not user:
        return RedirectResponse(url="/login")

    return {
        "user": user,
        "authenticated": True
    }
