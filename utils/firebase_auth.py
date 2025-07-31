# Firebase Authentication for FastAPI
import os
import json
from typing import Optional, Dict
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
import logging

logger = logging.getLogger(__name__)

# Firebase configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "helferlain-a4178")
FIREBASE_PRIVATE_KEY_ID = os.getenv("FIREBASE_PRIVATE_KEY_ID")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n')
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
FIREBASE_CLIENT_ID = os.getenv("FIREBASE_CLIENT_ID")
FIREBASE_AUTH_URI = os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth")
FIREBASE_TOKEN_URI = os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token")

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Try to use service account key file if available
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            
            if service_account_path and os.path.exists(service_account_path):
                # Use service account file
                cred = credentials.Certificate(service_account_path)
                logger.info("Using Firebase service account file")
            elif all([FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID]):
                # Use environment variables
                service_account_info = {
                    "type": "service_account",
                    "project_id": FIREBASE_PROJECT_ID,
                    "private_key_id": FIREBASE_PRIVATE_KEY_ID,
                    "private_key": FIREBASE_PRIVATE_KEY,
                    "client_email": FIREBASE_CLIENT_EMAIL,
                    "client_id": FIREBASE_CLIENT_ID,
                    "auth_uri": FIREBASE_AUTH_URI,
                    "token_uri": FIREBASE_TOKEN_URI,
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{FIREBASE_CLIENT_EMAIL.replace('@', '%40')}"
                }
                cred = credentials.Certificate(service_account_info)
                logger.info("Using Firebase service account from environment variables")
            else:
                # Fall back to default credentials (for local development)
                logger.warning("No Firebase credentials found, using default credentials")
                cred = credentials.ApplicationDefault()
            
            firebase_admin.initialize_app(cred, {
                'projectId': FIREBASE_PROJECT_ID,
            })
            logger.info(f"Firebase Admin SDK initialized for project: {FIREBASE_PROJECT_ID}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            # For development/testing, create a mock Firebase app
            logger.warning("Creating mock Firebase initialization for development")
            try:
                firebase_admin.initialize_app(options={'projectId': FIREBASE_PROJECT_ID})
            except Exception as fallback_error:
                logger.error(f"Even fallback Firebase initialization failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Firebase initialization failed"
                )

# Initialize Firebase on module import (with fallback)
FIREBASE_AVAILABLE = False
try:
    initialize_firebase()
    FIREBASE_AVAILABLE = True
    logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.warning(f"Firebase Admin SDK not available, using fallback mode: {e}")
    FIREBASE_AVAILABLE = False

# Security scheme
security = HTTPBearer()

class FirebaseAuth:
    """Firebase authentication handler"""
    
    @staticmethod
    def verify_id_token(id_token: str) -> Dict:
        """Verify Firebase ID token"""
        try:
            # Verify the ID token while checking if the token is revoked
            decoded_token = auth.verify_id_token(id_token, check_revoked=True)
            return decoded_token
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid Firebase ID token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except auth.ExpiredIdTokenError as e:
            logger.error(f"Expired Firebase ID token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except auth.RevokedIdTokenError as e:
            logger.error(f"Revoked Firebase ID token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
        except auth.CertificateFetchError as e:
            logger.error(f"Certificate fetch error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service temporarily unavailable"
            )
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
    
    @staticmethod
    def get_user_from_token(id_token: str) -> Dict:
        """Extract user information from Firebase ID token"""
        try:
            decoded_token = FirebaseAuth.verify_id_token(id_token)
            
            user_id = decoded_token.get("uid")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            # Extract standard Firebase ID token claims
            return {
                "id": user_id,
                "uid": user_id,
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "iss": decoded_token.get("iss"),
                "aud": decoded_token.get("aud"),
                "auth_time": decoded_token.get("auth_time"),
                "exp": decoded_token.get("exp"),
                "iat": decoded_token.get("iat"),
                "sub": user_id,
                "firebase": {
                    "identities": decoded_token.get("firebase", {}).get("identities", {}),
                    "sign_in_provider": decoded_token.get("firebase", {}).get("sign_in_provider", "unknown")
                },
                # Keep compatibility with Supabase format
                "role": "authenticated",
                "user_metadata": {
                    "name": decoded_token.get("name"),
                    "picture": decoded_token.get("picture"),
                    "email_verified": decoded_token.get("email_verified", False)
                },
                "app_metadata": {}
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error extracting user from Firebase token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to extract user information"
            )

# FastAPI dependency for protected routes
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Get current user from Firebase ID token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required"
        )
    
    if FIREBASE_AVAILABLE:
        return FirebaseAuth.get_user_from_token(token)
    else:
        # Fallback: Simple token validation for development
        logger.warning("Using fallback authentication - Firebase Admin SDK not available")
        try:
            # Basic JWT decode without verification (DEVELOPMENT ONLY)
            import jwt
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("user_id") or payload.get("sub") or payload.get("uid")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            return {
                "id": user_id,
                "uid": user_id,
                "email": payload.get("email", "unknown@firebase.com"),
                "role": "authenticated",
                "user_metadata": {},
                "app_metadata": {}
            }
        except Exception as e:
            logger.error(f"Fallback token validation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )

# Optional dependency - returns None if no auth
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return FirebaseAuth.get_user_from_token(credentials.credentials)
    except HTTPException:
        return None

# Alternative method for custom headers (temporary compatibility)
from fastapi import Request

async def get_current_user_from_headers(request: Request) -> Optional[Dict]:
    """Get current user from custom Firebase headers (fallback method)"""
    # Check for custom Firebase headers that the frontend might be sending
    firebase_user = request.headers.get("X-Firebase-User")
    firebase_email = request.headers.get("X-Firebase-Email")
    
    if firebase_user and firebase_email:
        logger.info(f"Using Firebase custom headers: user={firebase_user}, email={firebase_email}")
        return {
            "id": firebase_user,
            "uid": firebase_user,
            "email": firebase_email,
            "role": "authenticated",
            "user_metadata": {},
            "app_metadata": {}
        }
    
    return None

# Hybrid dependency that tries both methods
async def get_current_user_hybrid(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict:
    """Try Firebase token first, then custom headers as fallback"""
    
    # Method 1: Try Firebase token authentication
    if credentials and credentials.credentials:
        try:
            if FIREBASE_AVAILABLE:
                return FirebaseAuth.get_user_from_token(credentials.credentials)
            else:
                # Fallback JWT decode
                import jwt
                payload = jwt.decode(credentials.credentials, options={"verify_signature": False})
                user_id = payload.get("user_id") or payload.get("sub") or payload.get("uid")
                if user_id:
                    logger.info(f"Authenticated via fallback JWT: {user_id}")
                    return {
                        "id": user_id,
                        "uid": user_id,
                        "email": payload.get("email", "unknown@firebase.com"),
                        "role": "authenticated",
                        "user_metadata": {},
                        "app_metadata": {}
                    }
        except Exception as e:
            logger.warning(f"Token authentication failed, trying headers: {e}")
    
    # Method 2: Try custom headers
    user_from_headers = await get_current_user_from_headers(request)
    if user_from_headers:
        return user_from_headers
    
    # No authentication found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required - no valid token or headers found"
    )