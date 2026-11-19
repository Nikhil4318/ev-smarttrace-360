from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut, UserProfileUpdate
from app.security.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.simulation_service import seed_demo_vehicle_if_empty

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
<<<<<<< HEAD
    # Validate password length (min 8 characters)
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    # Normalise email for consistency (lowercase and trimmed)
    normalized_email = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
=======
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
        )

    user = User(
        name=user_in.name,
<<<<<<< HEAD
        email=normalized_email,
=======
        email=user_in.email,
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
        password_hash=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

<<<<<<< HEAD
    # Seed demo vehicle for new user (only works if SEED_DEMO is true)
=======
    # Seed demo vehicle for new user
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    seed_demo_vehicle_if_empty(db, user.id)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
<<<<<<< HEAD
        email=user.email,
=======
        email=user.email
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    )


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
<<<<<<< HEAD
    email = login_in.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
=======
    user = db.query(User).filter(User.email == login_in.email).first()
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

<<<<<<< HEAD
    # Ensure user has a vehicle (demo seeding respects SEED_DEMO flag)
=======
    # Ensure user has a vehicle
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    seed_demo_vehicle_if_empty(db, user.id)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
<<<<<<< HEAD
        email=user.email,
=======
        email=user.email
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
<<<<<<< HEAD
    update_in: UserProfileUpdate,
=======
    update_in: UserProfileUpdate, 
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_in.name:
        current_user.name = update_in.name
    if update_in.password:
<<<<<<< HEAD
        # Enforce password length on update as well
        if len(update_in.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters",
            )
=======
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
        current_user.password_hash = get_password_hash(update_in.password)
    db.commit()
    db.refresh(current_user)
    return current_user
