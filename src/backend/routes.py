from fastapi import APIRouter
from .data_loader import load_developers

router = APIRouter()

@router.get("/developers")
def get_developers():
    return load_developers()